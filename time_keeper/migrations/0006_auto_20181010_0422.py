# Generated by Django 2.1.2 on 2018-10-10 04:22

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('time_keeper', '0005_tasks'),
    ]

    operations = [
        migrations.RenameModel(
            old_name='Tasks',
            new_name='Task',
        ),
    ]