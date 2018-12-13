from django.contrib import admin
from time_keeper import models

# Register your models here.

class SubTaskAdmin(admin.TabularInline):
    model = models.SubTask

class PrimaryTaskAdmin(admin.ModelAdmin):
   inlines = [SubTaskAdmin,]

admin.site.register(models.TimeRecord)
admin.site.register(models.SubTask)
admin.site.register(models.PrimaryTask,PrimaryTaskAdmin)
