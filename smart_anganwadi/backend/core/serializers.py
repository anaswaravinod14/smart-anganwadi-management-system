from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model
from .models import (
    AnganwadiCenter, Child, Attendance, GrowthRecord, Immunization,
    HealthRecord, Parent, PregnantWoman, PregnancyHealth, MaternalVaccination,
    FoodMenu, FoodStock, LearningActivity, ChildActivity, Notification
)

User = get_user_model()

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        token['role'] = user.role
        token['full_name'] = user.get_full_name() or user.username
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user
        center = None
        if user.role == 'worker':
            c = user.assigned_centers.first()
            if c:
                center = {'id': c.id, 'name': c.center_name, 'code': c.center_code}
        elif user.role == 'supervisor':
            c = user.supervised_centers.first()
            if c:
                center = {'id': c.id, 'name': c.center_name, 'code': c.center_code}

        linked_child = None
        if user.role == 'parent' and hasattr(user, 'parent_profile'):
            if user.parent_profile.child:
                linked_child = {
                    'id': user.parent_profile.child.id,
                    'name': user.parent_profile.child.name,
                    'child_id': user.parent_profile.child.child_id
                }

        data['user'] = {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'full_name': user.get_full_name() or user.username,
            'role': user.role,
            'phone': user.phone,
            'center': center,
            'linked_child': linked_child,
        }
        return data


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'phone', 'is_active', 'date_joined']
        read_only_fields = ['id', 'date_joined']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'first_name', 'last_name', 'role', 'phone']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            role=validated_data.get('role', 'worker'),
            phone=validated_data.get('phone', ''),
        )
        return user


class AnganwadiCenterSerializer(serializers.ModelSerializer):
    worker_name = serializers.CharField(source='worker.get_full_name', read_only=True)
    supervisor_name = serializers.CharField(source='supervisor.get_full_name', read_only=True)
    total_children = serializers.IntegerField(source='children.count', read_only=True)
    total_pregnant = serializers.IntegerField(source='pregnant_women.count', read_only=True)

    class Meta:
        model = AnganwadiCenter
        fields = '__all__'


class ChildSerializer(serializers.ModelSerializer):
    center_name = serializers.CharField(source='anganwadi_center.center_name', read_only=True)
    center_code = serializers.CharField(source='anganwadi_center.center_code', read_only=True)
    latest_growth = serializers.SerializerMethodField()
    attendance_stats = serializers.SerializerMethodField()
    pending_vaccines_count = serializers.SerializerMethodField()

    class Meta:
        model = Child
        fields = '__all__'

    def get_latest_growth(self, obj):
        record = obj.growth_records.first()
        if record:
            return {
                'date': record.date,
                'weight': record.weight,
                'height': record.height,
                'bmi': record.bmi,
                'growth_status': record.growth_status
            }
        return None

    def get_attendance_stats(self, obj):
        total = obj.attendances.count()
        if total == 0:
            return {'total': 0, 'present': 0, 'percentage': 100}
        present = obj.attendances.filter(status='Present').count()
        percentage = round((present / total) * 100, 1)
        return {'total': total, 'present': present, 'percentage': percentage}

    def get_pending_vaccines_count(self, obj):
        return obj.immunizations.filter(status__in=['Pending', 'Overdue']).count()


class AttendanceSerializer(serializers.ModelSerializer):
    child_name = serializers.CharField(source='child.name', read_only=True)
    child_id_code = serializers.CharField(source='child.child_id', read_only=True)
    center_name = serializers.CharField(source='child.anganwadi_center.center_name', read_only=True)

    class Meta:
        model = Attendance
        fields = '__all__'


class BulkAttendanceItemSerializer(serializers.Serializer):
    child_id = serializers.IntegerField()
    status = serializers.ChoiceField(choices=['Present', 'Absent'])
    remarks = serializers.CharField(required=False, allow_blank=True, default='')


class BulkAttendanceSerializer(serializers.Serializer):
    date = serializers.DateField()
    records = BulkAttendanceItemSerializer(many=True)


class GrowthRecordSerializer(serializers.ModelSerializer):
    child_name = serializers.CharField(source='child.name', read_only=True)
    child_id_code = serializers.CharField(source='child.child_id', read_only=True)
    gender = serializers.CharField(source='child.gender', read_only=True)
    date_of_birth = serializers.DateField(source='child.date_of_birth', read_only=True)

    class Meta:
        model = GrowthRecord
        fields = '__all__'


class ImmunizationSerializer(serializers.ModelSerializer):
    child_name = serializers.CharField(source='child.name', read_only=True)
    child_id_code = serializers.CharField(source='child.child_id', read_only=True)
    is_overdue = serializers.SerializerMethodField()

    class Meta:
        model = Immunization
        fields = '__all__'

    def get_is_overdue(self, obj):
        if obj.status == 'Overdue':
            return True
        from datetime import date
        if obj.next_due_date and obj.status == 'Pending' and obj.next_due_date < date.today():
            return True
        return False


class HealthRecordSerializer(serializers.ModelSerializer):
    child_name = serializers.CharField(source='child.name', read_only=True)
    child_id_code = serializers.CharField(source='child.child_id', read_only=True)

    class Meta:
        model = HealthRecord
        fields = '__all__'


class ParentSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    user_full_name = serializers.CharField(source='user.get_full_name', read_only=True)
    child_name = serializers.CharField(source='child.name', read_only=True)
    child_id_code = serializers.CharField(source='child.child_id', read_only=True)

    class Meta:
        model = Parent
        fields = '__all__'


class PregnancyHealthSerializer(serializers.ModelSerializer):
    pregnant_woman_name = serializers.CharField(source='pregnant_woman.name', read_only=True)

    class Meta:
        model = PregnancyHealth
        fields = '__all__'


class MaternalVaccinationSerializer(serializers.ModelSerializer):
    pregnant_woman_name = serializers.CharField(source='pregnant_woman.name', read_only=True)

    class Meta:
        model = MaternalVaccination
        fields = '__all__'


class PregnantWomanSerializer(serializers.ModelSerializer):
    center_name = serializers.CharField(source='anganwadi_center.center_name', read_only=True)
    latest_health = serializers.SerializerMethodField()
    vaccinations_count = serializers.SerializerMethodField()

    class Meta:
        model = PregnantWoman
        fields = '__all__'

    def get_latest_health(self, obj):
        rec = obj.health_records.first()
        if rec:
            return {
                'checkup_date': rec.checkup_date,
                'weight': rec.weight,
                'blood_pressure': rec.blood_pressure,
                'hemoglobin': rec.hemoglobin,
                'health_status': rec.health_status,
                'next_checkup_date': rec.next_checkup_date
            }
        return None

    def get_vaccinations_count(self, obj):
        return {
            'completed': obj.vaccinations.filter(status='Completed').count(),
            'pending': obj.vaccinations.filter(status='Pending').count(),
        }


class FoodMenuSerializer(serializers.ModelSerializer):
    center_name = serializers.CharField(source='anganwadi_center.center_name', read_only=True)

    class Meta:
        model = FoodMenu
        fields = '__all__'


class FoodStockSerializer(serializers.ModelSerializer):
    center_name = serializers.CharField(source='anganwadi_center.center_name', read_only=True)
    is_low = serializers.BooleanField(source='is_low_stock', read_only=True)

    class Meta:
        model = FoodStock
        fields = '__all__'


class LearningActivitySerializer(serializers.ModelSerializer):
    participations_count = serializers.IntegerField(source='child_participations.count', read_only=True)

    class Meta:
        model = LearningActivity
        fields = '__all__'


class ChildActivitySerializer(serializers.ModelSerializer):
    child_name = serializers.CharField(source='child.name', read_only=True)
    activity_title = serializers.CharField(source='activity.title', read_only=True)
    activity_type = serializers.CharField(source='activity.activity_type', read_only=True)

    class Meta:
        model = ChildActivity
        fields = '__all__'


class NotificationSerializer(serializers.ModelSerializer):
    recipient_name = serializers.CharField(source='recipient.get_full_name', read_only=True)

    class Meta:
        model = Notification
        fields = '__all__'
