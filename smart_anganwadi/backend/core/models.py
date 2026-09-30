from django.db import models
from django.contrib.auth.models import AbstractUser
from decimal import Decimal

class User(AbstractUser):
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('worker', 'Anganwadi Worker'),
        ('supervisor', 'Supervisor'),
        ('parent', 'Parent'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='worker')
    phone = models.CharField(max_length=20, blank=True, null=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"


class AnganwadiCenter(models.Model):
    center_name = models.CharField(max_length=150)
    center_code = models.CharField(max_length=50, unique=True)
    location = models.CharField(max_length=150)
    address = models.TextField()
    worker = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_centers',
        limit_choices_to={'role': 'worker'}
    )
    supervisor = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='supervised_centers',
        limit_choices_to={'role': 'supervisor'}
    )
    contact_number = models.CharField(max_length=20, blank=True)

    def __str__(self):
        return f"{self.center_name} ({self.center_code})"


class Child(models.Model):
    GENDER_CHOICES = (
        ('Male', 'Male'),
        ('Female', 'Female'),
        ('Other', 'Other'),
    )
    child_id = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=120)
    date_of_birth = models.DateField()
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES)
    photo = models.ImageField(upload_to='children_photos/', null=True, blank=True)
    address = models.TextField(blank=True)
    parent_name = models.CharField(max_length=120)
    parent_phone = models.CharField(max_length=20)
    admission_date = models.DateField()
    anganwadi_center = models.ForeignKey(
        AnganwadiCenter,
        on_delete=models.CASCADE,
        related_name='children'
    )
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.child_id})"


class Attendance(models.Model):
    STATUS_CHOICES = (
        ('Present', 'Present'),
        ('Absent', 'Absent'),
    )
    child = models.ForeignKey(Child, on_delete=models.CASCADE, related_name='attendances')
    date = models.DateField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='Present')
    remarks = models.CharField(max_length=255, blank=True)

    class Meta:
        unique_together = ('child', 'date')
        ordering = ['-date']

    def __str__(self):
        return f"{self.child.name} - {self.date} - {self.status}"


class GrowthRecord(models.Model):
    GROWTH_STATUS_CHOICES = (
        ('Normal', 'Normal'),
        ('Underweight', 'Underweight'),
        ('Severely Underweight', 'Severely Underweight'),
        ('Overweight', 'Overweight'),
    )
    child = models.ForeignKey(Child, on_delete=models.CASCADE, related_name='growth_records')
    date = models.DateField()
    height = models.DecimalField(max_digits=5, decimal_places=2, help_text="Height in cm")
    weight = models.DecimalField(max_digits=5, decimal_places=2, help_text="Weight in kg")
    bmi = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    growth_status = models.CharField(
        max_length=30,
        choices=GROWTH_STATUS_CHOICES,
        default='Normal'
    )
    remarks = models.TextField(blank=True)

    class Meta:
        ordering = ['-date']

    def save(self, *args, **kwargs):
        if self.height and self.weight:
            h_m = float(self.height) / 100.0
            if h_m > 0:
                calc_bmi = float(self.weight) / (h_m * h_m)
                self.bmi = round(Decimal(calc_bmi), 2)
                # Pediatric / WHO simplified guideline categorization
                if not self.growth_status or self.growth_status == 'Normal':
                    if calc_bmi < 13.5:
                        self.growth_status = 'Severely Underweight'
                    elif calc_bmi < 15.0:
                        self.growth_status = 'Underweight'
                    elif calc_bmi > 19.0:
                        self.growth_status = 'Overweight'
                    else:
                        self.growth_status = 'Normal'
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.child.name} Growth - {self.date}: {self.weight}kg, {self.height}cm"


class Immunization(models.Model):
    STATUS_CHOICES = (
        ('Completed', 'Completed'),
        ('Pending', 'Pending'),
        ('Overdue', 'Overdue'),
    )
    child = models.ForeignKey(Child, on_delete=models.CASCADE, related_name='immunizations')
    vaccine_name = models.CharField(max_length=100)
    vaccine_date = models.DateField(null=True, blank=True)
    next_due_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    remarks = models.CharField(max_length=255, blank=True)

    class Meta:
        ordering = ['next_due_date', 'vaccine_date']

    def __str__(self):
        return f"{self.child.name} - {self.vaccine_name} ({self.status})"


class HealthRecord(models.Model):
    child = models.ForeignKey(Child, on_delete=models.CASCADE, related_name='health_records')
    date = models.DateField()
    health_issue = models.CharField(max_length=200)
    temperature = models.DecimalField(max_digits=4, decimal_places=1, null=True, blank=True, help_text="Temperature")
    symptoms = models.TextField(blank=True)
    treatment = models.TextField(blank=True)
    referral_required = models.BooleanField(default=False)
    remarks = models.TextField(blank=True)

    class Meta:
        ordering = ['-date']

    def __str__(self):
        return f"{self.child.name} Health ({self.date}): {self.health_issue}"


class Parent(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='parent_profile')
    child = models.ForeignKey(Child, on_delete=models.SET_NULL, null=True, blank=True, related_name='parent_records')
    phone = models.CharField(max_length=20)
    address = models.TextField(blank=True)
    relationship = models.CharField(max_length=50, default='Mother')

    def __str__(self):
        child_label = self.child.name if self.child else "No child linked"
        return f"{self.user.get_full_name() or self.user.username} ({self.relationship} of {child_label})"


class PregnantWoman(models.Model):
    RISK_STATUS_CHOICES = (
        ('Normal', 'Normal'),
        ('Moderate Risk', 'Moderate Risk'),
        ('High Risk', 'High Risk'),
    )
    name = models.CharField(max_length=120)
    age = models.PositiveIntegerField()
    phone = models.CharField(max_length=20)
    address = models.TextField(blank=True)
    pregnancy_start_date = models.DateField()
    expected_delivery_date = models.DateField()
    anganwadi_center = models.ForeignKey(
        AnganwadiCenter,
        on_delete=models.CASCADE,
        related_name='pregnant_women'
    )
    risk_status = models.CharField(max_length=20, choices=RISK_STATUS_CHOICES, default='Normal')
    remarks = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['expected_delivery_date']

    def __str__(self):
        return f"{self.name} (EDD: {self.expected_delivery_date})"


class PregnancyHealth(models.Model):
    HEALTH_STATUS_CHOICES = (
        ('Good', 'Good'),
        ('Needs Care', 'Needs Care'),
        ('Critical', 'Critical'),
    )
    pregnant_woman = models.ForeignKey(
        PregnantWoman,
        on_delete=models.CASCADE,
        related_name='health_records'
    )
    checkup_date = models.DateField()
    weight = models.DecimalField(max_digits=5, decimal_places=2, help_text="Weight in kg")
    blood_pressure = models.CharField(max_length=20, help_text="e.g. 120/80")
    hemoglobin = models.DecimalField(max_digits=4, decimal_places=1, help_text="in g/dL")
    health_status = models.CharField(max_length=30, choices=HEALTH_STATUS_CHOICES, default='Good')
    doctor_advice = models.TextField(blank=True)
    next_checkup_date = models.DateField(null=True, blank=True)

    class Meta:
        ordering = ['-checkup_date']

    def __str__(self):
        return f"{self.pregnant_woman.name} Checkup ({self.checkup_date})"


class MaternalVaccination(models.Model):
    STATUS_CHOICES = (
        ('Completed', 'Completed'),
        ('Pending', 'Pending'),
        ('Overdue', 'Overdue'),
    )
    pregnant_woman = models.ForeignKey(
        PregnantWoman,
        on_delete=models.CASCADE,
        related_name='vaccinations'
    )
    vaccine_name = models.CharField(max_length=100)
    vaccination_date = models.DateField(null=True, blank=True)
    next_due_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')

    class Meta:
        ordering = ['next_due_date', 'vaccination_date']

    def __str__(self):
        return f"{self.pregnant_woman.name} - {self.vaccine_name} ({self.status})"


class FoodMenu(models.Model):
    menu_date = models.DateField()
    meal_name = models.CharField(max_length=100, help_text="e.g. Morning Snack, Lunch")
    ingredients = models.TextField()
    nutrition_details = models.TextField(help_text="Calories, Protein, Vitamins")
    quantity = models.CharField(max_length=100, help_text="e.g. 150g per child")
    anganwadi_center = models.ForeignKey(
        AnganwadiCenter,
        on_delete=models.CASCADE,
        related_name='food_menus'
    )

    class Meta:
        ordering = ['-menu_date']

    def __str__(self):
        return f"{self.meal_name} on {self.menu_date} ({self.anganwadi_center.center_name})"


class FoodStock(models.Model):
    item_name = models.CharField(max_length=100)
    available_quantity = models.DecimalField(max_digits=8, decimal_places=2)
    unit = models.CharField(max_length=20, default='kg')
    minimum_quantity = models.DecimalField(max_digits=8, decimal_places=2)
    expiry_date = models.DateField(null=True, blank=True)
    anganwadi_center = models.ForeignKey(
        AnganwadiCenter,
        on_delete=models.CASCADE,
        related_name='food_stocks'
    )

    @property
    def is_low_stock(self):
        return self.available_quantity <= self.minimum_quantity

    def __str__(self):
        return f"{self.item_name} - {self.available_quantity} {self.unit} ({self.anganwadi_center.center_name})"


class LearningActivity(models.Model):
    ACTIVITY_TYPE_CHOICES = (
        ('Song', 'Song'),
        ('Story', 'Story'),
        ('Drawing', 'Drawing'),
        ('Game', 'Game'),
        ('Language', 'Language'),
        ('Motor-Skill', 'Motor-Skill'),
        ('Group', 'Group'),
    )
    title = models.CharField(max_length=150)
    description = models.TextField()
    activity_type = models.CharField(max_length=30, choices=ACTIVITY_TYPE_CHOICES)
    age_group = models.CharField(max_length=50, default='3-6 Years')
    duration = models.PositiveIntegerField(help_text="in minutes", default=30)
    learning_objective = models.TextField()
    image = models.ImageField(upload_to='activities/', null=True, blank=True)

    class Meta:
        ordering = ['title']

    def __str__(self):
        return f"{self.title} ({self.activity_type})"


class ChildActivity(models.Model):
    PERFORMANCE_CHOICES = (
        ('Excellent', 'Excellent'),
        ('Good', 'Good'),
        ('Average', 'Average'),
        ('Needs Improvement', 'Needs Improvement'),
    )
    child = models.ForeignKey(Child, on_delete=models.CASCADE, related_name='activities')
    activity = models.ForeignKey(
        LearningActivity,
        on_delete=models.CASCADE,
        related_name='child_participations'
    )
    date = models.DateField()
    performance = models.CharField(max_length=30, choices=PERFORMANCE_CHOICES, default='Good')
    remarks = models.CharField(max_length=255, blank=True)

    class Meta:
        ordering = ['-date']

    def __str__(self):
        return f"{self.child.name} - {self.activity.title} ({self.performance})"


class Notification(models.Model):
    NOTIFICATION_TYPE_CHOICES = (
        ('Health', 'Health'),
        ('Vaccination', 'Vaccination'),
        ('Nutrition', 'Nutrition'),
        ('Attendance', 'Attendance'),
        ('General', 'General'),
    )
    title = models.CharField(max_length=150)
    message = models.TextField()
    notification_type = models.CharField(
        max_length=30,
        choices=NOTIFICATION_TYPE_CHOICES,
        default='General'
    )
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} for {self.recipient.username}"
