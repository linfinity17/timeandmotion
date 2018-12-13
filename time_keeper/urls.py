from django.urls import path
from . import views

urlpatterns = [
    path('',views.redir,name='redir'),
    path(r'timer',views.index,name='index'),
    path(r'logged_in',views.success,name='success'),
    path(r'base_layout',views.base_layout,name='base_layout'),
    path(r'login',views.login_page,name='login_page'),
    path(r'logout',views.logout_page,name='logout_page'),
    path(r'get_record/<str:user_logged>',views.get_record,name='get_record'),
    path(r'get_task',views.get_task,name='get_task'),
    path(r'post_data',views.post_data,name='post_data'),
    path(r'reset',views.reset,name='reset'),
]