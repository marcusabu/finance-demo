from django import forms
from models import *


class CategoryForm(forms.ModelForm):

    class Meta:
        model = Category
        exclude = ('transactions',)

    def __init__(self, *args, **kwargs):
        super(CategoryForm, self).__init__(*args, **kwargs)


class CategoryKeywordForm(forms.ModelForm):

    class Meta:
        model = CategoryKeyword
        fields = ['keyword']
