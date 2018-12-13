from django import forms

class DataForm(forms.Form):
	data = forms.CharField()
	id_button = forms.CharField()