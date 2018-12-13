from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login, logout
from django.http import HttpResponse, HttpResponseRedirect
from django.urls import reverse
from django.contrib.auth.models import User
from . import forms
from time_keeper import models
import json

# Create your views here.

def redir(request):
	return HttpResponseRedirect(reverse('index'))

def success(request):
	template='time_keeper/success.html'
	username=request.user
	return render(request,template,{'username':username})

def login_page(request):
	if str(request.user) != "AnonymousUser":
		return HttpResponseRedirect(reverse('index'))
	template='time_keeper/login.html'
	if request.method == 'POST':
		logged_user = request.POST['username'].strip()
		try:
		    user = User.objects.get(username=logged_user)
		    user.backend = 'django.contrib.auth.backends.ModelBackend'
		    login(request,user)
		    return HttpResponseRedirect(reverse('success'))
		except:
			message = "User does not exist"
			return render(request,template,{"message":message})
	return render(request,template)

def logout_page(request):
	logout(request)
	return HttpResponseRedirect(reverse('login_page'))

def reset(request):
    logout(request)
    return HttpResponseRedirect(reverse('login_page'))

@login_required(login_url="/login")
def base_layout(request):
	template='time_keeper/index.html'
	return render(request,template)


def get_record(request,user_logged):
	dict_list = []
	results=models.TimeRecord.objects.filter(user=user_logged)
	if results:
		for item in results:
			data_dict = {"model": "time_keeper.TimeRecord",
				"pk": item.local_id,
				"fields": {"user": item.user,
						"primary_task": item.primary_task,
						"sub_task": item.sub_task,
						"time_length": item.time_length,
						"start_time": item.start_time.strftime('%Y-%m-%dT%H:%M:%SZ'),
						"end_time": item.end_time.strftime('%Y-%m-%dT%H:%M:%SZ'),
						"pause_stamps": item.pause_stamps,
						"task_date": item.task_date.strftime('%Y-%m-%dT%H:%M:%SZ'),
						"no_of_transactions": item.no_of_transactions,
						"remarks": item.remarks,
						"completed": item.completed,
						}
					}
			pk = item.local_id
			dict_list.append(data_dict)
		pk += 1
	else:
		pk = 1

	return HttpResponse(json.dumps(dict_list))

def get_task(request):
	dict_list = []
	results=models.PrimaryTask.objects.all()
	pk = 1;
	for item in results:
		data_dict = {"model": "time_keeper.PrimaryTask",
			"pk": pk,
			"fields": {"id": item.id,
					"name" : item.name,
					}
				}
		pk += 1
		dict_list.append(data_dict)

	results=models.SubTask.objects.all()
	sub_task_list = []
	for item in results:
		data_dict = {"model": "time_keeper.SubTask",
			"order1" : item.primary_task.id,
			"order2" : item.id,
			"fields": {"id": item.id,
					"name" : item.name,
					"primary_task" : item.primary_task.id,
					}
				}
		sub_task_list.append(data_dict)
	ordered_list = sorted(sub_task_list,key=lambda k: k['order2'])
	ordered_list = sorted(ordered_list,key=lambda k: k['order1'])
	for item in ordered_list:
		item['pk'] = pk
		del item['order1']
		del item['order2']
		pk += 1
		dict_list.append(item)

	return HttpResponse(json.dumps(dict_list))

def clean_data(form):
	data_list = json.loads(form.cleaned_data['data'])
	print(form.cleaned_data['id_button'])
	existing_records = []
	for item in models.TimeRecord.objects.all():
		existing_records.append(item.id)
	for item in data_list:
		label = str(item["fields"]["user"]) + "_" + str(item["pk"])
		models.TimeRecord.objects.update_or_create(
			id = label,
			defaults = {
				'local_id' : item["pk"],
				'user' : item["fields"]["user"],
				'primary_task' : item["fields"]["primary_task"],
				'sub_task' : item["fields"]["sub_task"],
				'time_length' : item["fields"]["time_length"],
				'start_time' : item["fields"]["start_time"],
				'end_time' : item["fields"]["end_time"],
				'pause_stamps' : item["fields"]["pause_stamps"],
				'task_date' : item["fields"]["task_date"],
				'no_of_transactions' : item["fields"]["no_of_transactions"],
				'remarks' : item["fields"]["remarks"],
				'completed' : item["fields"]["completed"],
				}
			)


def post_data(request):
	template='time_keeper/post_data.html'
	form = forms.DataForm()
	if request.method == 'POST':
		form = forms.DataForm(request.POST)
		if form.is_valid():
#			put all save code here
			clean_data(form)
			return HttpResponseRedirect(reverse('index'))
	return render(request,template,{'form':form})

@login_required(login_url="/login")
def index(request):
	if request.method == 'POST':
		form = forms.DataForm(request.POST)
		if form.is_valid():
#			put all save code here
			clean_data(form)
			if form.cleaned_data['id_button'] == 'save':
				return HttpResponseRedirect(reverse('post_data'))
			return HttpResponseRedirect(reverse('index'))
	template='time_keeper/index.html'
	user = request.user
	primary_tasks = models.PrimaryTask.objects.all()
	sub_tasks = models.SubTask.objects.all()
	context = {"user":user,
				"primary_tasks":primary_tasks,
				"sub_tasks":sub_tasks,
			}
	return render(request,template,context)
