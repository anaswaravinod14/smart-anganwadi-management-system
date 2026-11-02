from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from datetime import date, timedelta
from decimal import Decimal
from core.models import (
    AnganwadiCenter, Child, Attendance, GrowthRecord, Immunization,
    HealthRecord, Parent, PregnantWoman, PregnancyHealth, MaternalVaccination,
    FoodMenu, FoodStock, LearningActivity, ChildActivity, Notification
)

User = get_user_model()

class Command(BaseCommand):
    help = 'Seeds sample demo data for Smart Anganwadi Management System (SAMS)'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.NOTICE('Starting SAMS demo data seeding...'))

        # 1. Create Users
        admin_user, _ = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@sams.gov.in',
                'first_name': 'Suresh',
                'last_name': 'Kumar',
                'role': 'admin',
                'is_staff': True,
                'is_superuser': True,
                'phone': '9876543210'
            }
        )
        admin_user.set_password('admin123')
        admin_user.save()

        worker_user, _ = User.objects.get_or_create(
            username='worker_priya',
            defaults={
                'email': 'priya.sharma@sams.gov.in',
                'first_name': 'Priya',
                'last_name': 'Sharma',
                'role': 'worker',
                'phone': '9812345678'
            }
        )
        worker_user.set_password('worker123')
        worker_user.save()

        teacher_user, _ = User.objects.get_or_create(
            username='teacher_meera',
            defaults={
                'email': 'meera.patel@sams.gov.in',
                'first_name': 'Meera',
                'last_name': 'Patel',
                'role': 'teacher',
                'phone': '9845671234'
            }
        )
        teacher_user.set_password('teacher123')
        teacher_user.save()

        parent_user, _ = User.objects.get_or_create(
            username='parent_rajesh',
            defaults={
                'email': 'rajesh.verma@example.com',
                'first_name': 'Rajesh',
                'last_name': 'Verma',
                'role': 'parent',
                'phone': '9834567890'
            }
        )
        parent_user.set_password('parent123')
        parent_user.save()

        self.stdout.write(self.style.SUCCESS('Users created/updated successfully.'))

        # 2. Anganwadi Centers
        center1, _ = AnganwadiCenter.objects.get_or_create(
            center_code='AW-101',
            defaults={
                'center_name': 'Asha Kiran Anganwadi Kendra #12',
                'location': 'Ward 4, Shanti Nagar, Block B',
                'address': 'Plot 45, Near Primary Health Sub-Centre, Shanti Nagar',
                'worker': worker_user,
                'teacher': teacher_user,
                'contact_number': '011-23456781'
            }
        )
        center1.worker = worker_user
        center1.teacher = teacher_user
        center1.save()

        center2, _ = AnganwadiCenter.objects.get_or_create(
            center_code='AW-102',
            defaults={
                'center_name': 'Prabhat Anganwadi Kendra #45',
                'location': 'Sector 9, Gandhi Basti, North Zone',
                'address': 'Community Hall Compound, Gandhi Basti',
                'worker': None,
                'contact_number': '011-23456782'
            }
        )
        center2.save()

        self.stdout.write(self.style.SUCCESS('Anganwadi centers seeded.'))

        # 3. Children (10 realistic child profiles)
        today = date.today()
        children_data = [
            {
                'child_id': 'CHD-101',
                'name': 'Aarav Verma',
                'gender': 'Male',
                'date_of_birth': today - timedelta(days=365*3 + 120),
                'parent_name': 'Rajesh Verma',
                'parent_phone': '9834567890',
                'address': 'House 12, Lane 3, Shanti Nagar',
                'admission_date': today - timedelta(days=300),
                'center': center1
            },
            {
                'child_id': 'CHD-102',
                'name': 'Ananya Patel',
                'gender': 'Female',
                'date_of_birth': today - timedelta(days=365*4 + 45),
                'parent_name': 'Sunita Patel',
                'parent_phone': '9890123456',
                'address': 'Flat 204, Shanti Heights',
                'admission_date': today - timedelta(days=350),
                'center': center1
            },
            {
                'child_id': 'CHD-103',
                'name': 'Vihaan Gupta',
                'gender': 'Male',
                'date_of_birth': today - timedelta(days=365*2 + 200),
                'parent_name': 'Ramesh Gupta',
                'parent_phone': '9871122334',
                'address': 'Plot 18, Gandhi Nagar',
                'admission_date': today - timedelta(days=220),
                'center': center1
            },
            {
                'child_id': 'CHD-104',
                'name': 'Diya Kumari',
                'gender': 'Female',
                'date_of_birth': today - timedelta(days=365*3 + 300),
                'parent_name': 'Manju Devi',
                'parent_phone': '9865544332',
                'address': 'Slum Cluster Pocket D',
                'admission_date': today - timedelta(days=180),
                'center': center1
            },
            {
                'child_id': 'CHD-105',
                'name': 'Reyansh Yadav',
                'gender': 'Male',
                'date_of_birth': today - timedelta(days=365*4 + 180),
                'parent_name': 'Santosh Yadav',
                'parent_phone': '9843322110',
                'address': 'Street 7, Shanti Nagar',
                'admission_date': today - timedelta(days=400),
                'center': center1
            },
            {
                'child_id': 'CHD-106',
                'name': 'Isha Sharma',
                'gender': 'Female',
                'date_of_birth': today - timedelta(days=365*2 + 80),
                'parent_name': 'Kavita Sharma',
                'parent_phone': '9811224455',
                'address': 'Room 5, Chawl No 3, Shanti Nagar',
                'admission_date': today - timedelta(days=150),
                'center': center1
            },
            {
                'child_id': 'CHD-107',
                'name': 'Kabir Das',
                'gender': 'Male',
                'date_of_birth': today - timedelta(days=365*3 + 10),
                'parent_name': 'Pooja Das',
                'parent_phone': '9822335566',
                'address': 'Lane 2, Sector 9, Gandhi Basti',
                'admission_date': today - timedelta(days=280),
                'center': center2
            },
            {
                'child_id': 'CHD-108',
                'name': 'Saanvi Joshi',
                'gender': 'Female',
                'date_of_birth': today - timedelta(days=365*4 + 90),
                'parent_name': 'Nikhil Joshi',
                'parent_phone': '9833446677',
                'address': 'Basti Quarter 22, North Zone',
                'admission_date': today - timedelta(days=320),
                'center': center2
            },
            {
                'child_id': 'CHD-109',
                'name': 'Arjun Meena',
                'gender': 'Male',
                'date_of_birth': today - timedelta(days=365*2 + 330),
                'parent_name': 'Kamla Meena',
                'parent_phone': '9844557788',
                'address': 'Sector 9 Outer hutments',
                'admission_date': today - timedelta(days=120),
                'center': center2
            },
            {
                'child_id': 'CHD-110',
                'name': 'Pari Chauhan',
                'gender': 'Female',
                'date_of_birth': today - timedelta(days=365*5 + 20),
                'parent_name': 'Geeta Chauhan',
                'parent_phone': '9855668899',
                'address': 'Near Water Tank, Gandhi Basti',
                'admission_date': today - timedelta(days=450),
                'center': center2
            },
        ]

        created_children = []
        for cd in children_data:
            child, _ = Child.objects.get_or_create(
                child_id=cd['child_id'],
                defaults={
                    'name': cd['name'],
                    'gender': cd['gender'],
                    'date_of_birth': cd['date_of_birth'],
                    'parent_name': cd['parent_name'],
                    'parent_phone': cd['parent_phone'],
                    'address': cd['address'],
                    'admission_date': cd['admission_date'],
                    'anganwadi_center': cd['center'],
                    'active': True
                }
            )
            created_children.append(child)

        # Link parent_user to child Aarav Verma (first child)
        Parent.objects.update_or_create(
            user=parent_user,
            defaults={
                'child': created_children[0],
                'phone': '9834567890',
                'address': 'House 12, Lane 3, Shanti Nagar',
                'relationship': 'Father'
            }
        )
        self.stdout.write(self.style.SUCCESS(f'Seeded {len(created_children)} children and linked Parent user.'))

        # 4. Attendance Records for past 10 days
        for day_offset in range(10):
            att_date = today - timedelta(days=day_offset)
            # Skip Sundays
            if att_date.weekday() == 6:
                continue

            for idx, ch in enumerate(created_children):
                # Simulate realistic attendance (some absent)
                status_val = 'Present'
                remarks_val = 'Arrived on time'
                if (idx + day_offset) % 6 == 0:
                    status_val = 'Absent'
                    remarks_val = 'Family out of town / mild fever'

                Attendance.objects.update_or_create(
                    child=ch,
                    date=att_date,
                    defaults={
                        'status': status_val,
                        'remarks': remarks_val
                    }
                )

        self.stdout.write(self.style.SUCCESS('Seeded multi-day attendance records.'))

        # 5. Growth Records (History spanning past 4 months)
        growth_samples = [
            # Child 1: Aarav Verma (Healthy progression)
            (created_children[0], today - timedelta(days=90), 91.5, 13.2, 'Normal', 'Healthy development'),
            (created_children[0], today - timedelta(days=60), 93.0, 13.8, 'Normal', 'Good appetite'),
            (created_children[0], today - timedelta(days=30), 94.2, 14.3, 'Normal', 'Active in learning'),
            (created_children[0], today - timedelta(days=5), 95.5, 14.8, 'Normal', 'Optimal growth milestone'),

            # Child 2: Ananya Patel (Normal)
            (created_children[1], today - timedelta(days=60), 98.0, 15.0, 'Normal', 'Regular meal intake'),
            (created_children[1], today - timedelta(days=10), 100.0, 15.6, 'Normal', 'Good physical growth'),

            # Child 3: Vihaan Gupta (Underweight alert for demo!)
            (created_children[2], today - timedelta(days=60), 84.0, 10.1, 'Underweight', 'Weight gain slow'),
            (created_children[2], today - timedelta(days=8), 85.0, 10.4, 'Underweight', 'Nutritional supplementary feed provided'),

            # Child 4: Diya Kumari (Severely Underweight alert for demo!)
            (created_children[3], today - timedelta(days=45), 89.0, 9.8, 'Severely Underweight', 'Poor appetite, lethargic'),
            (created_children[3], today - timedelta(days=6), 89.5, 10.0, 'Severely Underweight', 'Referred to NRC / Doctor consult advised'),

            # Child 5: Reyansh Yadav (Normal)
            (created_children[4], today - timedelta(days=30), 102.0, 16.5, 'Normal', 'Very energetic'),

            # Child 6: Isha Sharma (Normal)
            (created_children[5], today - timedelta(days=20), 83.5, 11.2, 'Normal', 'Normal growth'),

            # Child 7: Kabir Das (Overweight demo)
            (created_children[6], today - timedelta(days=15), 93.0, 17.5, 'Overweight', 'Balanced diet guidance given to mother'),

            # Child 8: Saanvi Joshi
            (created_children[7], today - timedelta(days=25), 101.5, 16.0, 'Normal', 'Regular growth'),

            # Child 9: Arjun Meena (Underweight)
            (created_children[8], today - timedelta(days=12), 86.0, 10.6, 'Underweight', 'Supplementary nutrition doubled'),

            # Child 10: Pari Chauhan
            (created_children[9], today - timedelta(days=14), 106.0, 17.8, 'Normal', 'Ready for formal primary school'),
        ]

        for ch, gdate, h, w, gst, rem in growth_samples:
            GrowthRecord.objects.update_or_create(
                child=ch,
                date=gdate,
                defaults={
                    'height': Decimal(str(h)),
                    'weight': Decimal(str(w)),
                    'growth_status': gst,
                    'remarks': rem
                }
            )
        self.stdout.write(self.style.SUCCESS('Seeded historical growth trajectory records.'))

        # 6. Immunizations (Indian Universal Immunization Programme)
        vaccines_schedule = [
            ('BCG', today - timedelta(days=360), 'Completed'),
            ('OPV 1', today - timedelta(days=300), 'Completed'),
            ('Pentavalent 1', today - timedelta(days=300), 'Completed'),
            ('Rotavirus 1', today - timedelta(days=300), 'Completed'),
            ('OPV 2', today - timedelta(days=240), 'Completed'),
            ('Pentavalent 2', today - timedelta(days=240), 'Completed'),
            ('OPV 3', today - timedelta(days=180), 'Completed'),
            ('Pentavalent 3', today - timedelta(days=180), 'Completed'),
            ('Measles-Rubella (MR) 1', today - timedelta(days=60), 'Completed'),
            ('Vitamin A (1st Dose)', today - timedelta(days=60), 'Completed'),
            ('DPT Booster 1', today + timedelta(days=7), 'Pending'),
            ('MR 2 / Vitamin A 2', today + timedelta(days=20), 'Pending'),
        ]

        for ch in created_children:
            for vname, vdate, vstatus in vaccines_schedule[:8]:
                Immunization.objects.get_or_create(
                    child=ch,
                    vaccine_name=vname,
                    defaults={
                        'vaccine_date': vdate,
                        'status': 'Completed',
                        'remarks': 'Administered at PHC'
                    }
                )

        # Overdue alert demo: Aarav has MR 1 completed, but Diya missed MR 1 (Overdue)
        Immunization.objects.update_or_create(
            child=created_children[3], # Diya
            vaccine_name='Measles-Rubella (MR) 1',
            defaults={
                'status': 'Overdue',
                'next_due_date': today - timedelta(days=15),
                'remarks': 'Missed due to mother illness. Follow up required immediately.'
            }
        )

        # Upcoming vaccine demo: Aarav has DPT Booster due in 7 days
        Immunization.objects.update_or_create(
            child=created_children[0], # Aarav
            vaccine_name='DPT Booster 1',
            defaults={
                'status': 'Pending',
                'next_due_date': today + timedelta(days=7),
                'remarks': 'Scheduled at Kendra on Wednesday session'
            }
        )

        # Upcoming vaccine demo for Vihaan
        Immunization.objects.update_or_create(
            child=created_children[2], # Vihaan
            vaccine_name='Vitamin A (2nd Dose)',
            defaults={
                'status': 'Pending',
                'next_due_date': today + timedelta(days=5),
                'remarks': 'Due during upcoming nutrition drive'
            }
        )

        self.stdout.write(self.style.SUCCESS('Seeded immunization records & upcoming/overdue alerts.'))

        # 7. Health Records
        HealthRecord.objects.get_or_create(
            child=created_children[3], # Diya
            date=today - timedelta(days=6),
            defaults={
                'health_issue': 'Severe acute malnutrition & recurring diarrhea',
                'temperature': Decimal('99.2'),
                'symptoms': 'Pale conjunctiva, low activity, weight loss',
                'treatment': 'ORS packets given, Zinc supplements 14-day pack',
                'referral_required': True,
                'remarks': 'Urgent referral slip issued to Community Health Centre (CHC)'
            }
        )

        HealthRecord.objects.get_or_create(
            child=created_children[0], # Aarav
            date=today - timedelta(days=25),
            defaults={
                'health_issue': 'Mild Seasonal Cough',
                'temperature': Decimal('98.6'),
                'symptoms': 'Dry cough at night',
                'treatment': 'Warm fluids, Tulsi-ginger advice given to parents',
                'referral_required': False,
                'remarks': 'Completely resolved in 4 days'
            }
        )

        HealthRecord.objects.get_or_create(
            child=created_children[1], # Ananya
            date=today - timedelta(days=40),
            defaults={
                'health_issue': 'Scabies / Skin rash',
                'temperature': Decimal('98.4'),
                'symptoms': 'Itching on wrists and fingers',
                'treatment': 'Permethrin lotion application instructed for whole family',
                'referral_required': False,
                'remarks': 'Cleanliness and hygiene guidelines explained'
            }
        )
        self.stdout.write(self.style.SUCCESS('Seeded health records with medical referral flag.'))

        # 8. Pregnant Women (3 women: 1 High Risk, 1 Moderate, 1 Normal)
        pw1, _ = PregnantWoman.objects.get_or_create(
            name='Sunita Devi',
            defaults={
                'age': 24,
                'phone': '9819988776',
                'address': 'Gali 2, Shanti Nagar, Block B',
                'pregnancy_start_date': today - timedelta(days=210),
                'expected_delivery_date': today + timedelta(days=70),
                'anganwadi_center': center1,
                'risk_status': 'High Risk',
                'remarks': 'Severe anemia detected in 2nd trimester; BP fluctuates'
            }
        )

        pw2, _ = PregnantWoman.objects.get_or_create(
            name='Meenakshi Rao',
            defaults={
                'age': 28,
                'phone': '9829988775',
                'address': 'House 44, Shanti Nagar Extension',
                'pregnancy_start_date': today - timedelta(days=120),
                'expected_delivery_date': today + timedelta(days=160),
                'anganwadi_center': center1,
                'risk_status': 'Normal',
                'remarks': 'Healthy progression, taking IFA tablets regularly'
            }
        )

        pw3, _ = PregnantWoman.objects.get_or_create(
            name='Kalyani Mondal',
            defaults={
                'age': 21,
                'phone': '9839988774',
                'address': 'Quarter 14, Gandhi Basti',
                'pregnancy_start_date': today - timedelta(days=180),
                'expected_delivery_date': today + timedelta(days=100),
                'anganwadi_center': center2,
                'risk_status': 'Moderate Risk',
                'remarks': 'Marginal low weight gain, monitored closely'
            }
        )

        # Pregnancy Health Checkups
        PregnancyHealth.objects.get_or_create(
            pregnant_woman=pw1,
            checkup_date=today - timedelta(days=10),
            defaults={
                'weight': Decimal('49.5'),
                'blood_pressure': '138/88',
                'hemoglobin': Decimal('8.4'),
                'health_status': 'Needs Care',
                'doctor_advice': 'Double dose IFA (Iron-Folic Acid), high-protein diet, consult gynecologist',
                'next_checkup_date': today + timedelta(days=14)
            }
        )

        PregnancyHealth.objects.get_or_create(
            pregnant_woman=pw2,
            checkup_date=today - timedelta(days=15),
            defaults={
                'weight': Decimal('56.2'),
                'blood_pressure': '118/76',
                'hemoglobin': Decimal('11.8'),
                'health_status': 'Good',
                'doctor_advice': 'Continue calcium & IFA supplements, gentle walking',
                'next_checkup_date': today + timedelta(days=20)
            }
        )

        # Maternal Vaccinations
        MaternalVaccination.objects.get_or_create(
            pregnant_woman=pw1,
            vaccine_name='Tetanus Toxoid (TT 1)',
            defaults={
                'vaccination_date': today - timedelta(days=150),
                'status': 'Completed'
            }
        )
        MaternalVaccination.objects.get_or_create(
            pregnant_woman=pw1,
            vaccine_name='Tetanus Toxoid (TT 2)',
            defaults={
                'vaccination_date': today - timedelta(days=90),
                'status': 'Completed'
            }
        )
        MaternalVaccination.objects.get_or_create(
            pregnant_woman=pw2,
            vaccine_name='Tetanus Toxoid (TT 1)',
            defaults={
                'vaccination_date': today - timedelta(days=60),
                'status': 'Completed'
            }
        )
        MaternalVaccination.objects.get_or_create(
            pregnant_woman=pw2,
            vaccine_name='Tetanus Toxoid (TT 2)',
            defaults={
                'next_due_date': today + timedelta(days=10),
                'status': 'Pending'
            }
        )
        self.stdout.write(self.style.SUCCESS('Seeded pregnant women, checkups, and maternal vaccinations.'))

        # 9. Food Menu (Daily meal plans)
        meals_plan = [
            (today, 'Hot Cooked Meal - Moong Dal Khichdi with Spinach', 'Rice, Moong Dal, Spinach, Turmeric, Cumin, Pure Ghee', '380 kcal, 12g Protein, Iron, Vitamin A', '150g per child', center1),
            (today, 'Morning Snack - Boiled Egg or Banana', 'Fresh Eggs / Bananas, Milk', '120 kcal, 6g Protein, Calcium', '1 unit per child', center1),
            (today - timedelta(days=1), 'Vegetable Pulao with Soya Chunks', 'Rice, Soya Granules, Peas, Carrots, Onions', '350 kcal, 14g Protein', '160g per child', center1),
            (today - timedelta(days=2), 'Sweet Daliya (Broken Wheat Porridge)', 'Broken wheat, Milk, Jaggery, Almond shavings', '320 kcal, 8g Protein', '140g per child', center1),
            (today, 'Pushtahar (Nutritious Kheer)', 'Rice, Jaggery, Milk, Groundnuts', '340 kcal, 10g Protein', '150g per child', center2),
        ]

        for mdate, mname, ing, nut, qty, cen in meals_plan:
            FoodMenu.objects.get_or_create(
                menu_date=mdate,
                meal_name=mname,
                anganwadi_center=cen,
                defaults={
                    'ingredients': ing,
                    'nutrition_details': nut,
                    'quantity': qty
                }
            )
        self.stdout.write(self.style.SUCCESS('Seeded food menus.'))

        # 10. Food Stock with Low-Stock Alerts
        stock_items = [
            # center 1
            ('Rice (PDS Fortified)', Decimal('65.0'), 'kg', Decimal('20.0'), today + timedelta(days=180), center1),
            ('Wheat Flour (Atta)', Decimal('12.0'), 'kg', Decimal('25.0'), today + timedelta(days=90), center1), # LOW STOCK!
            ('Moong Dal / Pulses', Decimal('8.5'), 'kg', Decimal('15.0'), today + timedelta(days=120), center1), # LOW STOCK!
            ('Fortified Cooking Oil', Decimal('18.0'), 'Litre', Decimal('10.0'), today + timedelta(days=200), center1),
            ('Jaggery (Gur)', Decimal('14.0'), 'kg', Decimal('8.0'), today + timedelta(days=150), center1),
            ('Skimmed Milk Powder', Decimal('4.0'), 'kg', Decimal('10.0'), today + timedelta(days=60), center1), # LOW STOCK!

            # center 2
            ('Rice (PDS Fortified)', Decimal('45.0'), 'kg', Decimal('20.0'), today + timedelta(days=180), center2),
            ('Wheat Flour (Atta)', Decimal('32.0'), 'kg', Decimal('20.0'), today + timedelta(days=90), center2),
            ('Chana Dal', Decimal('19.0'), 'kg', Decimal('12.0'), today + timedelta(days=120), center2),
            ('Fortified Cooking Oil', Decimal('5.0'), 'Litre', Decimal('8.0'), today + timedelta(days=100), center2), # LOW STOCK!
        ]

        for item, qty, unit, min_q, exp, cen in stock_items:
            FoodStock.objects.get_or_create(
                item_name=item,
                anganwadi_center=cen,
                defaults={
                    'available_quantity': qty,
                    'unit': unit,
                    'minimum_quantity': min_q,
                    'expiry_date': exp
                }
            )
        self.stdout.write(self.style.SUCCESS('Seeded food stock inventory with triggered low-stock alerts.'))

        # 11. Learning Activities & Child Participation
        act1, _ = LearningActivity.objects.get_or_create(
            title='Hindi Action Rhyme: "Titli Udi Bus Pe Chadhi"',
            defaults={
                'description': 'Children sing the classic rhyme with coordinated hand gestures and hops.',
                'activity_type': 'Song',
                'age_group': '3-5 Years',
                'duration': 25,
                'learning_objective': 'Gross motor skills, rhythm coordination, and vocabulary building'
            }
        )

        act2, _ = LearningActivity.objects.get_or_create(
            title='Clay Modeling: Making Fruits & Vegetables',
            defaults={
                'description': 'Children use non-toxic dough to sculpt mangoes, apples, and round rotis.',
                'activity_type': 'Motor-Skill',
                'age_group': '4-6 Years',
                'duration': 35,
                'learning_objective': 'Fine motor control, color recognition, tactile sensory development'
            }
        )

        act3, _ = LearningActivity.objects.get_or_create(
            title='Storytelling with Puppet: "The Thirsty Crow"',
            defaults={
                'description': 'Worker demonstrates patience, problem-solving, and asking questions.',
                'activity_type': 'Story',
                'age_group': '3-6 Years',
                'duration': 30,
                'learning_objective': 'Listening comprehension, empathy, cause-and-effect understanding'
            }
        )

        act4, _ = LearningActivity.objects.get_or_create(
            title='Counting Colorful Wooden Beads (1 to 10)',
            defaults={
                'description': 'Children thread beads onto strings while chanting numbers aloud.',
                'activity_type': 'Game',
                'age_group': '4-6 Years',
                'duration': 30,
                'learning_objective': 'Early numeracy, hand-eye coordination, pattern recognition'
            }
        )

        # Record participations for children
        ChildActivity.objects.get_or_create(
            child=created_children[0], # Aarav
            activity=act1,
            date=today - timedelta(days=1),
            defaults={
                'performance': 'Excellent',
                'remarks': 'Knew all verses by heart, enthusiastic leader in group singing'
            }
        )

        ChildActivity.objects.get_or_create(
            child=created_children[0], # Aarav
            activity=act2,
            date=today - timedelta(days=3),
            defaults={
                'performance': 'Good',
                'remarks': 'Made accurate shapes of orange and banana'
            }
        )

        ChildActivity.objects.get_or_create(
            child=created_children[1], # Ananya
            activity=act3,
            date=today - timedelta(days=2),
            defaults={
                'performance': 'Excellent',
                'remarks': 'Answered all story comprehension questions correctly'
            }
        )

        self.stdout.write(self.style.SUCCESS('Seeded learning activities & child participations.'))

        # 12. Notifications for various roles
        notifications_data = [
            (admin_user, 'Monthly ICDS Report Ready', 'The consolidated district nutrition and attendance report for this month is ready for download.', 'General'),
            (worker_user, 'Urgent: Vaccine Overdue for Diya Kumari', 'Diya Kumari (CHD-104) has missed Measles-Rubella dose. Please contact parents.', 'Vaccination'),
            (teacher_user, 'ECCE Activity Today: Storytelling & Shapes', 'Schedule 10:30 AM preschool learning session with children.', 'Activity'),
            (worker_user, 'Low Stock Alert: Wheat & Moong Dal', 'Wheat Flour is below minimum threshold (12 kg left). Place indent with district warehouse.', 'Nutrition'),
            (parent_user, 'Aarav Verma - DPT Booster Upcoming', 'Reminder: Aarav has his DPT Booster vaccination due next Wednesday at Asha Kiran Kendra.', 'Vaccination'),
            (parent_user, 'Today Menu: Nutritious Khichdi', 'Today meal: Hot cooked Moong Dal Khichdi with fresh spinach and boiled egg.', 'Nutrition'),
        ]

        for recip, title, msg, ntype in notifications_data:
            Notification.objects.get_or_create(
                recipient=recip,
                title=title,
                defaults={
                    'message': msg,
                    'notification_type': ntype,
                    'is_read': False
                }
            )

        self.stdout.write(self.style.SUCCESS('Seeded realistic role-based notifications.'))
        self.stdout.write(self.style.SUCCESS('=== SAMS DEMO SEED DATA COMPLETED SUCCESSFULLY! ==='))
