# Generated by Django 2.1.2 on 2018-10-11 06:21

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('time_keeper', '0008_auto_20181010_0935'),
    ]

    operations = [
        migrations.CreateModel(
            name='User',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('user', models.CharField(max_length=255)),
            ],
        ),
    ]
