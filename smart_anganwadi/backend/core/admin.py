from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import (
    User, AnganwadiCenter, Child, Attendance, GrowthRecord, Immunization,
    HealthRecord, Parent, PregnantWoman, PregnancyHealth, MaternalVaccination,
    FoodMenu, FoodStock, LearningActivity, ChildActivity, Notification
)

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['username', 'email', 'first_name', 'last_name', 'role', 'phone', 'is_staff']
    list_filter = ['role', 'is_staff', 'is_active']
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Role & Profile Info', {'fields': ('role', 'phone', 'avatar')}),
    )
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('Role & Profile Info', {'fields': ('role', 'phone', 'avatar')}),
    )
    search_fields = ['username', 'first_name', 'last_name', 'email', 'phone']


@admin.register(AnganwadiCenter)
class AnganwadiCenterAdmin(admin.ModelAdmin):
    list_display = ['center_name', 'center_code', 'location', 'worker', 'teacher', 'contact_number']
    search_fields = ['center_name', 'center_code', 'location']
    list_filter = ['location']


@admin.register(Child)
class ChildAdmin(admin.ModelAdmin):
    list_display = ['child_id', 'name', 'gender', 'date_of_birth', 'parent_name', 'parent_phone', 'anganwadi_center', 'active']
    list_filter = ['gender', 'active', 'anganwadi_center', 'admission_date']
    search_fields = ['name', 'child_id', 'parent_name', 'parent_phone']
    ordering = ['name']
    readonly_fields = ['created_at']


@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ['child', 'date', 'status', 'remarks']
    list_filter = ['status', 'date', 'child__anganwadi_center']
    search_fields = ['child__name', 'child__child_id']
    date_hierarchy = 'date'


@admin.register(GrowthRecord)
class GrowthRecordAdmin(admin.ModelAdmin):
    list_display = ['child', 'date', 'height', 'weight', 'bmi', 'growth_status']
    list_filter = ['growth_status', 'date', 'child__anganwadi_center']
    search_fields = ['child__name', 'child__child_id']
    date_hierarchy = 'date'


@admin.register(Immunization)
class ImmunizationAdmin(admin.ModelAdmin):
    list_display = ['child', 'vaccine_name', 'vaccine_date', 'next_due_date', 'status']
    list_filter = ['status', 'vaccine_name', 'next_due_date']
    search_fields = ['child__name', 'child__child_id', 'vaccine_name']


@admin.register(HealthRecord)
class HealthRecordAdmin(admin.ModelAdmin):
    list_display = ['child', 'date', 'health_issue', 'temperature', 'referral_required']
    list_filter = ['referral_required', 'date', 'child__anganwadi_center']
    search_fields = ['child__name', 'child__child_id', 'health_issue', 'symptoms']
    date_hierarchy = 'date'


@admin.register(Parent)
class ParentAdmin(admin.ModelAdmin):
    list_display = ['user', 'child', 'relationship', 'phone']
    search_fields = ['user__username', 'user__first_name', 'user__last_name', 'child__name', 'phone']


@admin.register(PregnantWoman)
class PregnantWomanAdmin(admin.ModelAdmin):
    list_display = ['name', 'age', 'phone', 'expected_delivery_date', 'risk_status', 'anganwadi_center']
    list_filter = ['risk_status', 'anganwadi_center']
    search_fields = ['name', 'phone']
    date_hierarchy = 'expected_delivery_date'


@admin.register(PregnancyHealth)
class PregnancyHealthAdmin(admin.ModelAdmin):
    list_display = ['pregnant_woman', 'checkup_date', 'weight', 'blood_pressure', 'hemoglobin', 'health_status', 'next_checkup_date']
    list_filter = ['health_status', 'checkup_date']
    search_fields = ['pregnant_woman__name']
    date_hierarchy = 'checkup_date'


@admin.register(MaternalVaccination)
class MaternalVaccinationAdmin(admin.ModelAdmin):
    list_display = ['pregnant_woman', 'vaccine_name', 'vaccination_date', 'next_due_date', 'status']
    list_filter = ['status', 'vaccine_name']
    search_fields = ['pregnant_woman__name', 'vaccine_name']


@admin.register(FoodMenu)
class FoodMenuAdmin(admin.ModelAdmin):
    list_display = ['menu_date', 'meal_name', 'quantity', 'anganwadi_center']
    list_filter = ['menu_date', 'anganwadi_center']
    search_fields = ['meal_name', 'ingredients']


@admin.register(FoodStock)
class FoodStockAdmin(admin.ModelAdmin):
    list_display = ['item_name', 'available_quantity', 'unit', 'minimum_quantity', 'is_low_stock', 'expiry_date', 'anganwadi_center']
    list_filter = ['anganwadi_center', 'unit']
    search_fields = ['item_name']

    def is_low_stock(self, obj):
        return obj.is_low_stock
    is_low_stock.boolean = True


@admin.register(LearningActivity)
class LearningActivityAdmin(admin.ModelAdmin):
    list_display = ['title', 'activity_type', 'age_group', 'duration']
    list_filter = ['activity_type', 'age_group']
    search_fields = ['title', 'description', 'learning_objective']


@admin.register(ChildActivity)
class ChildActivityAdmin(admin.ModelAdmin):
    list_display = ['child', 'activity', 'date', 'performance']
    list_filter = ['performance', 'date', 'activity__activity_type']
    search_fields = ['child__name', 'activity__title']


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['title', 'recipient', 'notification_type', 'is_read', 'created_at']
    list_filter = ['notification_type', 'is_read', 'created_at']
    search_fields = ['title', 'message', 'recipient__username']
