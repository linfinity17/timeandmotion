from django.db import models

# Create your models here.
class TimeRecord(models.Model):
	id=models.CharField(primary_key=True,max_length=100)
	local_id=models.IntegerField()
	user=models.CharField(max_length=50)
	primary_task=models.CharField(max_length=100)
	sub_task=models.CharField(max_length=100)
	time_length=models.CharField(max_length=100,null=True)
	start_time=models.DateTimeField()
	end_time=models.DateTimeField()
	pause_stamps=models.TextField(null=True)
	task_date=models.DateTimeField()
	no_of_transactions=models.IntegerField(default=1)
	remarks=models.TextField(null=True)
	completed=models.BooleanField(default=True)

class PrimaryTask(models.Model):
    id=models.IntegerField(primary_key=True)
    name=models.CharField(max_length=255)

    def __str__(self):
        return self.name

class SubTask(models.Model):
    id=models.AutoField(primary_key=True)
    name=models.CharField(max_length=255)
    primary_task=models.ForeignKey('PrimaryTask',on_delete=models.CASCADE)

    def __str__(self):
        display = "ID #" + str(self.id) + "  - " + self.name + "  (" +  str(self.primary_task) + ")"
        return display