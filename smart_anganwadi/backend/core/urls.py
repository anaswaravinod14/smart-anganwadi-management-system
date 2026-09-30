from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    CustomTokenObtainPairView, RegisterView, CurrentUserView,
    UserViewSet, AnganwadiCenterViewSet, ChildViewSet, AttendanceViewSet,
    GrowthRecordViewSet, ImmunizationViewSet, HealthRecordViewSet,
    ParentViewSet, PregnantWomanViewSet, PregnancyHealthViewSet,
    MaternalVaccinationViewSet, FoodMenuViewSet, FoodStockViewSet,
    LearningActivityViewSet, ChildActivityViewSet, NotificationViewSet,
    DashboardStatsView, DashboardChartsView, AlertsView, ReportExportCSVView
)

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'anganwadi-centers', AnganwadiCenterViewSet, basename='anganwadi-center')
router.register(r'children', ChildViewSet, basename='child')
router.register(r'attendance', AttendanceViewSet, basename='attendance')
router.register(r'growth', GrowthRecordViewSet, basename='growth')
router.register(r'immunizations', ImmunizationViewSet, basename='immunization')
router.register(r'health-records', HealthRecordViewSet, basename='health-record')
router.register(r'parents', ParentViewSet, basename='parent')
router.register(r'pregnant-women', PregnantWomanViewSet, basename='pregnant-woman')
router.register(r'pregnancy-health', PregnancyHealthViewSet, basename='pregnancy-health')
router.register(r'maternal-vaccinations', MaternalVaccinationViewSet, basename='maternal-vaccination')
router.register(r'food-menu', FoodMenuViewSet, basename='food-menu')
router.register(r'food-stock', FoodStockViewSet, basename='food-stock')
router.register(r'learning-activities', LearningActivityViewSet, basename='learning-activity')
router.register(r'child-activities', ChildActivityViewSet, basename='child-activity')
router.register(r'notifications', NotificationViewSet, basename='notification')

urlpatterns = [
    # Auth endpoints
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='auth_login'),
    path('auth/register/', RegisterView.as_view(), name='auth_register'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='auth_refresh'),
    path('auth/me/', CurrentUserView.as_view(), name='auth_me'),

    # Analytics & Reports
    path('dashboard/stats/', DashboardStatsView.as_view(), name='dashboard_stats'),
    path('dashboard/charts/', DashboardChartsView.as_view(), name='dashboard_charts'),
    path('alerts/', AlertsView.as_view(), name='system_alerts'),
    path('reports/export-csv/', ReportExportCSVView.as_view(), name='reports_export_csv'),

    # ViewSet Router endpoints
    path('', include(router.urls)),
]
