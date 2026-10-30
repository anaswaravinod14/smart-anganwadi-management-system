import csv
from datetime import date, timedelta
from decimal import Decimal
from django.db.models import Q, F, Count
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from rest_framework import viewsets, status, views, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import (
    AnganwadiCenter, Child, Attendance, GrowthRecord, Immunization,
    HealthRecord, Parent, PregnantWoman, PregnancyHealth, MaternalVaccination,
    FoodMenu, FoodStock, LearningActivity, ChildActivity, Notification
)
from .serializers import (
    CustomTokenObtainPairSerializer, UserSerializer, RegisterSerializer,
    AnganwadiCenterSerializer, ChildSerializer, AttendanceSerializer,
    BulkAttendanceSerializer, GrowthRecordSerializer, ImmunizationSerializer,
    HealthRecordSerializer, ParentSerializer, PregnantWomanSerializer,
    PregnancyHealthSerializer, MaternalVaccinationSerializer, FoodMenuSerializer,
    FoodStockSerializer, LearningActivitySerializer, ChildActivitySerializer,
    NotificationSerializer
)
from .permissions import (
    IsAdminRole, IsWorkerRole, RoleBasedAccessPermission
)

User = get_user_model()

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class RegisterView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CurrentUserView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        data = serializer.data
        data['role'] = request.user.role
        data['full_name'] = request.user.get_full_name() or request.user.username

        if request.user.role == 'worker':
            center = request.user.assigned_centers.first()
            if center:
                data['center'] = {'id': center.id, 'name': center.center_name, 'code': center.center_code}
        elif request.user.role == 'parent' and hasattr(request.user, 'parent_profile'):
            if request.user.parent_profile.child:
                data['linked_child'] = {
                    'id': request.user.parent_profile.child.id,
                    'name': request.user.parent_profile.child.name,
                    'child_id': request.user.parent_profile.child.child_id
                }
        return Response(data)

    def patch(self, request):
        user = request.user
        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer
    permission_classes = [IsAdminRole]

    def get_queryset(self):
        qs = super().get_queryset()
        role = self.request.query_params.get('role')
        if role:
            qs = qs.filter(role=role)
        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(
                Q(username__icontains=search) |
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search) |
                Q(email__icontains=search)
            )
        return qs


class AnganwadiCenterViewSet(viewsets.ModelViewSet):
    queryset = AnganwadiCenter.objects.all().order_by('center_name')
    serializer_class = AnganwadiCenterSerializer
    permission_classes = [RoleBasedAccessPermission]

    def get_queryset(self):
        user = self.request.user
        qs = super().get_queryset()
        if user.role == 'worker':
            assigned = user.assigned_centers.all()
            if assigned.exists():
                return assigned
        return qs


class ChildViewSet(viewsets.ModelViewSet):
    queryset = Child.objects.all().select_related('anganwadi_center').order_by('name')
    serializer_class = ChildSerializer
    permission_classes = [RoleBasedAccessPermission]

    def get_queryset(self):
        user = self.request.user
        qs = super().get_queryset()

        if user.role == 'parent':
            if hasattr(user, 'parent_profile') and user.parent_profile.child:
                return qs.filter(id=user.parent_profile.child.id)
            return qs.none()

        center_id = self.request.query_params.get('center')
        if center_id:
            qs = qs.filter(anganwadi_center_id=center_id)
        elif user.role == 'worker':
            assigned_center = user.assigned_centers.first()
            if assigned_center:
                qs = qs.filter(anganwadi_center=assigned_center)

        gender = self.request.query_params.get('gender')
        if gender:
            qs = qs.filter(gender=gender)

        active = self.request.query_params.get('active')
        if active is not None:
            qs = qs.filter(active=active.lower() == 'true')

        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(
                Q(name__icontains=search) |
                Q(child_id__icontains=search) |
                Q(parent_name__icontains=search) |
                Q(parent_phone__icontains=search)
            )

        return qs

    @action(detail=True, methods=['get'])
    def growth_history(self, request, pk=None):
        child = self.get_object()
        records = child.growth_records.all().order_by('date')
        data = GrowthRecordSerializer(records, many=True).data
        return Response(data)

    @action(detail=True, methods=['get'])
    def full_profile(self, request, pk=None):
        child = self.get_object()
        child_data = ChildSerializer(child).data
        child_data['growth_history'] = GrowthRecordSerializer(child.growth_records.all().order_by('date'), many=True).data
        child_data['immunizations'] = ImmunizationSerializer(child.immunizations.all().order_by('next_due_date'), many=True).data
        child_data['health_records'] = HealthRecordSerializer(child.health_records.all().order_by('-date'), many=True).data
        child_data['activities'] = ChildActivitySerializer(child.activities.all().order_by('-date'), many=True).data
        child_data['recent_attendance'] = AttendanceSerializer(child.attendances.all().order_by('-date')[:30], many=True).data
        return Response(child_data)


class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.all().select_related('child', 'child__anganwadi_center').order_by('-date')
    serializer_class = AttendanceSerializer
    permission_classes = [RoleBasedAccessPermission]

    def get_queryset(self):
        user = self.request.user
        qs = super().get_queryset()

        if user.role == 'parent':
            if hasattr(user, 'parent_profile') and user.parent_profile.child:
                return qs.filter(child=user.parent_profile.child)
            return qs.none()

        child_id = self.request.query_params.get('child')
        if child_id:
            qs = qs.filter(child_id=child_id)

        center_id = self.request.query_params.get('center')
        if center_id:
            qs = qs.filter(child__anganwadi_center_id=center_id)
        elif user.role == 'worker':
            assigned = user.assigned_centers.first()
            if assigned:
                qs = qs.filter(child__anganwadi_center=assigned)

        att_date = self.request.query_params.get('date')
        if att_date:
            qs = qs.filter(date=att_date)

        status_param = self.request.query_params.get('status')
        if status_param:
            qs = qs.filter(status=status_param)

        return qs

    @action(detail=False, methods=['post'])
    def bulk_record(self, request):
        serializer = BulkAttendanceSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        rec_date = serializer.validated_data['date']
        records_data = serializer.validated_data['records']

        created_or_updated = []
        for item in records_data:
            child = get_object_or_404(Child, id=item['child_id'])
            att, _ = Attendance.objects.update_or_create(
                child=child,
                date=rec_date,
                defaults={
                    'status': item['status'],
                    'remarks': item.get('remarks', '')
                }
            )
            created_or_updated.append(att.id)

        return Response({
            'message': f'Successfully updated attendance for {len(created_or_updated)} children on {rec_date}',
            'count': len(created_or_updated)
        }, status=status.HTTP_200_OK)


class GrowthRecordViewSet(viewsets.ModelViewSet):
    queryset = GrowthRecord.objects.all().select_related('child').order_by('-date')
    serializer_class = GrowthRecordSerializer
    permission_classes = [RoleBasedAccessPermission]

    def get_queryset(self):
        user = self.request.user
        qs = super().get_queryset()

        if user.role == 'parent':
            if hasattr(user, 'parent_profile') and user.parent_profile.child:
                return qs.filter(child=user.parent_profile.child)
            return qs.none()

        child_id = self.request.query_params.get('child')
        if child_id:
            qs = qs.filter(child_id=child_id)

        growth_status = self.request.query_params.get('growth_status')
        if growth_status:
            qs = qs.filter(growth_status=growth_status)

        center_id = self.request.query_params.get('center')
        if center_id:
            qs = qs.filter(child__anganwadi_center_id=center_id)

        return qs


class ImmunizationViewSet(viewsets.ModelViewSet):
    queryset = Immunization.objects.all().select_related('child').order_by('next_due_date')
    serializer_class = ImmunizationSerializer
    permission_classes = [RoleBasedAccessPermission]

    def get_queryset(self):
        user = self.request.user
        qs = super().get_queryset()

        if user.role == 'parent':
            if hasattr(user, 'parent_profile') and user.parent_profile.child:
                return qs.filter(child=user.parent_profile.child)
            return qs.none()

        child_id = self.request.query_params.get('child')
        if child_id:
            qs = qs.filter(child_id=child_id)

        status_param = self.request.query_params.get('status')
        if status_param:
            qs = qs.filter(status=status_param)

        center_id = self.request.query_params.get('center')
        if center_id:
            qs = qs.filter(child__anganwadi_center_id=center_id)

        return qs


class HealthRecordViewSet(viewsets.ModelViewSet):
    queryset = HealthRecord.objects.all().select_related('child').order_by('-date')
    serializer_class = HealthRecordSerializer
    permission_classes = [RoleBasedAccessPermission]

    def get_queryset(self):
        user = self.request.user
        qs = super().get_queryset()

        if user.role == 'parent':
            if hasattr(user, 'parent_profile') and user.parent_profile.child:
                return qs.filter(child=user.parent_profile.child)
            return qs.none()

        child_id = self.request.query_params.get('child')
        if child_id:
            qs = qs.filter(child_id=child_id)

        referral = self.request.query_params.get('referral_required')
        if referral is not None:
            qs = qs.filter(referral_required=referral.lower() == 'true')

        center_id = self.request.query_params.get('center')
        if center_id:
            qs = qs.filter(child__anganwadi_center_id=center_id)

        return qs


class ParentViewSet(viewsets.ModelViewSet):
    queryset = Parent.objects.all().select_related('user', 'child').order_by('user__username')
    serializer_class = ParentSerializer
    permission_classes = [RoleBasedAccessPermission]


class PregnantWomanViewSet(viewsets.ModelViewSet):
    queryset = PregnantWoman.objects.all().select_related('anganwadi_center').order_by('expected_delivery_date')
    serializer_class = PregnantWomanSerializer
    permission_classes = [RoleBasedAccessPermission]

    def get_queryset(self):
        user = self.request.user
        qs = super().get_queryset()

        center_id = self.request.query_params.get('center')
        if center_id:
            qs = qs.filter(anganwadi_center_id=center_id)
        elif user.role == 'worker':
            assigned = user.assigned_centers.first()
            if assigned:
                qs = qs.filter(anganwadi_center=assigned)

        risk_status = self.request.query_params.get('risk_status')
        if risk_status:
            qs = qs.filter(risk_status=risk_status)

        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(
                Q(name__icontains=search) |
                Q(phone__icontains=search)
            )

        return qs

    @action(detail=True, methods=['get'])
    def full_details(self, request, pk=None):
        woman = self.get_object()
        data = PregnantWomanSerializer(woman).data
        data['checkups'] = PregnancyHealthSerializer(woman.health_records.all().order_by('-checkup_date'), many=True).data
        data['vaccinations'] = MaternalVaccinationSerializer(woman.vaccinations.all().order_by('next_due_date'), many=True).data
        return Response(data)


class PregnancyHealthViewSet(viewsets.ModelViewSet):
    queryset = PregnancyHealth.objects.all().select_related('pregnant_woman').order_by('-checkup_date')
    serializer_class = PregnancyHealthSerializer
    permission_classes = [RoleBasedAccessPermission]

    def get_queryset(self):
        qs = super().get_queryset()
        woman_id = self.request.query_params.get('pregnant_woman')
        if woman_id:
            qs = qs.filter(pregnant_woman_id=woman_id)
        return qs


class MaternalVaccinationViewSet(viewsets.ModelViewSet):
    queryset = MaternalVaccination.objects.all().select_related('pregnant_woman').order_by('next_due_date')
    serializer_class = MaternalVaccinationSerializer
    permission_classes = [RoleBasedAccessPermission]

    def get_queryset(self):
        qs = super().get_queryset()
        woman_id = self.request.query_params.get('pregnant_woman')
        if woman_id:
            qs = qs.filter(pregnant_woman_id=woman_id)
        return qs


class FoodMenuViewSet(viewsets.ModelViewSet):
    queryset = FoodMenu.objects.all().select_related('anganwadi_center').order_by('-menu_date')
    serializer_class = FoodMenuSerializer
    permission_classes = [RoleBasedAccessPermission]

    def get_queryset(self):
        qs = super().get_queryset()
        menu_date = self.request.query_params.get('date')
        if menu_date:
            qs = qs.filter(menu_date=menu_date)
        center_id = self.request.query_params.get('center')
        if center_id:
            qs = qs.filter(anganwadi_center_id=center_id)
        return qs


class FoodStockViewSet(viewsets.ModelViewSet):
    queryset = FoodStock.objects.all().select_related('anganwadi_center').order_by('item_name')
    serializer_class = FoodStockSerializer
    permission_classes = [RoleBasedAccessPermission]

    def get_queryset(self):
        qs = super().get_queryset()
        center_id = self.request.query_params.get('center')
        if center_id:
            qs = qs.filter(anganwadi_center_id=center_id)

        low_only = self.request.query_params.get('low_stock')
        if low_only and low_only.lower() == 'true':
            qs = qs.filter(available_quantity__lte=F('minimum_quantity'))

        return qs


class LearningActivityViewSet(viewsets.ModelViewSet):
    queryset = LearningActivity.objects.all().order_by('title')
    serializer_class = LearningActivitySerializer
    permission_classes = [RoleBasedAccessPermission]

    def get_queryset(self):
        qs = super().get_queryset()
        act_type = self.request.query_params.get('type')
        if act_type:
            qs = qs.filter(activity_type=act_type)
        return qs


class ChildActivityViewSet(viewsets.ModelViewSet):
    queryset = ChildActivity.objects.all().select_related('child', 'activity').order_by('-date')
    serializer_class = ChildActivitySerializer
    permission_classes = [RoleBasedAccessPermission]

    def get_queryset(self):
        user = self.request.user
        qs = super().get_queryset()
        if user.role == 'parent':
            if hasattr(user, 'parent_profile') and user.parent_profile.child:
                return qs.filter(child=user.parent_profile.child)
            return qs.none()
        child_id = self.request.query_params.get('child')
        if child_id:
            qs = qs.filter(child_id=child_id)
        return qs


class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all().order_by('-created_at')
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(recipient=self.request.user)

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response({'status': 'marked as read'})

    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        self.get_queryset().update(is_read=True)
        return Response({'status': 'all marked as read'})


# -------------------------------------------------------------
# Analytics, Dashboard Stats, Charts & Alert Endpoints
# -------------------------------------------------------------

class DashboardStatsView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        today = date.today()

        # Scope querysets based on user role
        center_filter = Q()
        if user.role == 'worker':
            assigned = user.assigned_centers.first()
            if assigned:
                center_filter = Q(anganwadi_center=assigned)

        if user.role == 'parent':
            child = getattr(user.parent_profile, 'child', None) if hasattr(user, 'parent_profile') else None
            if not child:
                return Response({'message': 'No child linked to parent'}, status=200)

            total_att = child.attendances.count()
            present_att = child.attendances.filter(status='Present').count()
            latest_growth = child.growth_records.first()
            pending_vac = child.immunizations.filter(status__in=['Pending', 'Overdue']).count()

            return Response({
                'child_name': child.name,
                'child_id': child.child_id,
                'gender': child.gender,
                'date_of_birth': child.date_of_birth,
                'center_name': child.anganwadi_center.center_name,
                'attendance_rate': round((present_att / total_att * 100), 1) if total_att > 0 else 100,
                'present_days': present_att,
                'total_attendance_days': total_att,
                'latest_weight': latest_growth.weight if latest_growth else None,
                'latest_height': latest_growth.height if latest_growth else None,
                'latest_bmi': latest_growth.bmi if latest_growth else None,
                'growth_status': latest_growth.growth_status if latest_growth else 'Normal',
                'pending_vaccines': pending_vac,
                'recent_health_issues': child.health_records.count(),
            })

        # For Admin and Worker
        children_qs = Child.objects.filter(center_filter, active=True)
        total_children = children_qs.count()

        # Today's attendance
        today_att = Attendance.objects.filter(child__in=children_qs, date=today)
        present_today = today_att.filter(status='Present').count()
        absent_today = today_att.filter(status='Absent').count()

        # At risk children (Severely Underweight, Underweight or health referral required)
        underweight_children_ids = GrowthRecord.objects.filter(
            child__in=children_qs,
            growth_status__in=['Severely Underweight', 'Underweight']
        ).values_list('child_id', flat=True).distinct()

        referral_children_ids = HealthRecord.objects.filter(
            child__in=children_qs,
            referral_required=True
        ).values_list('child_id', flat=True).distinct()

        at_risk_count = len(set(list(underweight_children_ids) + list(referral_children_ids)))

        # Pregnant women count
        pw_qs = PregnantWoman.objects.filter(center_filter)
        total_pregnant = pw_qs.count()
        high_risk_pregnant = pw_qs.filter(risk_status='High Risk').count()

        # Upcoming vaccinations in next 14 days
        upcoming_vaccines = Immunization.objects.filter(
            child__in=children_qs,
            status='Pending',
            next_due_date__range=[today, today + timedelta(days=14)]
        ).count()

        overdue_vaccines = Immunization.objects.filter(
            child__in=children_qs,
            status='Overdue'
        ).count()

        # Low food stock
        stock_filter = Q()
        if user.role == 'worker' and user.assigned_centers.exists():
            stock_filter = Q(anganwadi_center=user.assigned_centers.first())

        low_food_stock = FoodStock.objects.filter(
            stock_filter,
            available_quantity__lte=F('minimum_quantity')
        ).count()

        # Pending health checks (children with referral or no check in last 60 days)
        pending_health_checks = HealthRecord.objects.filter(
            child__in=children_qs,
            referral_required=True
        ).count()

        return Response({
            'total_children': total_children,
            'present_today': present_today,
            'absent_today': absent_today,
            'at_risk_children': at_risk_count,
            'total_pregnant_women': total_pregnant,
            'high_risk_pregnant': high_risk_pregnant,
            'upcoming_vaccinations': upcoming_vaccines,
            'overdue_vaccinations': overdue_vaccines,
            'low_food_stock': low_food_stock,
            'pending_health_checks': pending_health_checks,
            'total_centers': AnganwadiCenter.objects.count()
        })


class DashboardChartsView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        today = date.today()
        user = request.user

        center_filter = Q()
        if user.role == 'worker' and user.assigned_centers.exists():
            center_filter = Q(anganwadi_center=user.assigned_centers.first())

        children = Child.objects.filter(center_filter, active=True)

        # 1. Monthly Attendance Trend (Last 10 recorded dates or last 14 days)
        dates = [today - timedelta(days=i) for i in range(9, -1, -1)]
        attendance_trend = []
        for d in dates:
            day_records = Attendance.objects.filter(child__in=children, date=d)
            tot = day_records.count()
            pres = day_records.filter(status='Present').count()
            rate = round((pres / tot * 100), 1) if tot > 0 else 0
            attendance_trend.append({
                'date': d.strftime('%d %b'),
                'present': pres,
                'absent': tot - pres,
                'rate': rate
            })

        # 2. Nutrition / Growth Status distribution
        # Grab the latest growth record for each active child
        status_counts = {'Normal': 0, 'Underweight': 0, 'Severely Underweight': 0, 'Overweight': 0}
        for c in children:
            latest = c.growth_records.first()
            if latest and latest.growth_status in status_counts:
                status_counts[latest.growth_status] += 1
            else:
                status_counts['Normal'] += 1

        growth_distribution = [
            {'name': k, 'value': v} for k, v in status_counts.items()
        ]

        # 3. Gender Distribution
        male_count = children.filter(gender='Male').count()
        female_count = children.filter(gender='Female').count()
        gender_distribution = [
            {'name': 'Boys', 'value': male_count},
            {'name': 'Girls', 'value': female_count},
        ]

        # 4. Immunization Coverage
        all_imm = Immunization.objects.filter(child__in=children)
        completed_imm = all_imm.filter(status='Completed').count()
        pending_imm = all_imm.filter(status='Pending').count()
        overdue_imm = all_imm.filter(status='Overdue').count()
        immunization_coverage = [
            {'name': 'Completed', 'value': completed_imm},
            {'name': 'Pending', 'value': pending_imm},
            {'name': 'Overdue', 'value': overdue_imm},
        ]

        # 5. Center-wise statistics
        centers_data = []
        for c in AnganwadiCenter.objects.all():
            c_children = c.children.filter(active=True).count()
            c_pregnant = c.pregnant_women.count()
            c_present = Attendance.objects.filter(child__anganwadi_center=c, date=today, status='Present').count()
            centers_data.append({
                'center_name': c.center_name,
                'children': c_children,
                'pregnant': c_pregnant,
                'present_today': c_present
            })

        return Response({
            'attendance_trend': attendance_trend,
            'growth_distribution': growth_distribution,
            'gender_distribution': gender_distribution,
            'immunization_coverage': immunization_coverage,
            'center_stats': centers_data
        })


class AlertsView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        today = date.today()
        alerts = []

        # 1. Overdue & upcoming vaccines
        overdue_vaccines = Immunization.objects.filter(
            Q(status='Overdue') | Q(status='Pending', next_due_date__lt=today)
        ).select_related('child', 'child__anganwadi_center')[:10]

        for v in overdue_vaccines:
            alerts.append({
                'type': 'vaccine_overdue',
                'severity': 'danger',
                'title': f'Vaccine Overdue: {v.vaccine_name}',
                'message': f'{v.child.name} ({v.child.child_id}) missed {v.vaccine_name} due on {v.next_due_date}.',
                'center': v.child.anganwadi_center.center_name,
                'child_id': v.child.id,
            })

        # 2. Low food stock
        low_stocks = FoodStock.objects.filter(
            available_quantity__lte=F('minimum_quantity')
        ).select_related('anganwadi_center')[:10]

        for s in low_stocks:
            alerts.append({
                'type': 'low_stock',
                'severity': 'warning',
                'title': f'Low Food Stock: {s.item_name}',
                'message': f'{s.item_name} has only {s.available_quantity} {s.unit} remaining (Min: {s.minimum_quantity} {s.unit}).',
                'center': s.anganwadi_center.center_name,
                'stock_id': s.id,
            })

        # 3. High risk pregnant women
        high_risk_pw = PregnantWoman.objects.filter(
            risk_status='High Risk'
        ).select_related('anganwadi_center')[:10]

        for p in high_risk_pw:
            alerts.append({
                'type': 'high_risk_maternal',
                'severity': 'danger',
                'title': f'High Risk Pregnancy: {p.name}',
                'message': f'{p.name} (EDD: {p.expected_delivery_date}) flagged as High Risk. Checkup needed.',
                'center': p.anganwadi_center.center_name,
                'woman_id': p.id,
            })

        # 4. Medical referral required
        referrals = HealthRecord.objects.filter(
            referral_required=True
        ).select_related('child', 'child__anganwadi_center')[:10]

        for r in referrals:
            alerts.append({
                'type': 'health_referral',
                'severity': 'warning',
                'title': f'Health Referral Required: {r.child.name}',
                'message': f'{r.child.name} has issue: {r.health_issue} ({r.treatment}). Doctor visit required.',
                'center': r.child.anganwadi_center.center_name,
                'child_id': r.child.id,
            })

        return Response(alerts)


class ReportExportCSVView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        report_type = request.query_params.get('type', 'children')
        response = HttpResponse(content_type='text/csv')

        if report_type == 'attendance':
            response['Content-Disposition'] = 'attachment; filename="sams_attendance_report.csv"'
            writer = csv.writer(response)
            writer.writerow(['Date', 'Child ID', 'Child Name', 'Center', 'Status', 'Remarks'])
            records = Attendance.objects.select_related('child', 'child__anganwadi_center').all().order_by('-date')[:500]
            for r in records:
                writer.writerow([r.date, r.child.child_id, r.child.name, r.child.anganwadi_center.center_name, r.status, r.remarks])

        elif report_type == 'growth':
            response['Content-Disposition'] = 'attachment; filename="sams_growth_report.csv"'
            writer = csv.writer(response)
            writer.writerow(['Date', 'Child ID', 'Child Name', 'Gender', 'Height (cm)', 'Weight (kg)', 'BMI', 'Status', 'Remarks'])
            records = GrowthRecord.objects.select_related('child').all().order_by('-date')[:500]
            for r in records:
                writer.writerow([r.date, r.child.child_id, r.child.name, r.child.gender, r.height, r.weight, r.bmi, r.growth_status, r.remarks])

        elif report_type == 'food_stock':
            response['Content-Disposition'] = 'attachment; filename="sams_food_stock_report.csv"'
            writer = csv.writer(response)
            writer.writerow(['Item Name', 'Center', 'Available Quantity', 'Unit', 'Minimum Quantity', 'Is Low Stock', 'Expiry Date'])
            records = FoodStock.objects.select_related('anganwadi_center').all()
            for r in records:
                writer.writerow([r.item_name, r.anganwadi_center.center_name, r.available_quantity, r.unit, r.minimum_quantity, 'YES' if r.is_low_stock else 'NO', r.expiry_date or 'N/A'])

        elif report_type == 'pregnant_women':
            response['Content-Disposition'] = 'attachment; filename="sams_pregnant_women_report.csv"'
            writer = csv.writer(response)
            writer.writerow(['Name', 'Age', 'Phone', 'Center', 'Pregnancy Start', 'Expected Delivery', 'Risk Status', 'Remarks'])
            records = PregnantWoman.objects.select_related('anganwadi_center').all()
            for r in records:
                writer.writerow([r.name, r.age, r.phone, r.anganwadi_center.center_name, r.pregnancy_start_date, r.expected_delivery_date, r.risk_status, r.remarks])

        else: # Default children
            response['Content-Disposition'] = 'attachment; filename="sams_children_report.csv"'
            writer = csv.writer(response)
            writer.writerow(['Child ID', 'Name', 'Gender', 'DOB', 'Parent Name', 'Parent Phone', 'Center', 'Admission Date', 'Active'])
            records = Child.objects.select_related('anganwadi_center').all()
            for r in records:
                writer.writerow([r.child_id, r.name, r.gender, r.date_of_birth, r.parent_name, r.parent_phone, r.anganwadi_center.center_name, r.admission_date, 'Active' if r.active else 'Inactive'])

        return response
