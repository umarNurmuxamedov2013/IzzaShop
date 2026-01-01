from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('shop/', views.product_list, name='shop'),
    path('category/<slug:category_slug>/', views.product_list, name='product_by_category'),
    path('product/<slug:slug>/', views.product_detail, name='product_detail'),
    path('search/', views.search, name='search'),
    path('contact/', views.contact, name='contact'),
    path('about/', views.about, name='about'),
    path('discounts/', views.discounts, name='discounts'),
    path('wishlist/', views.wishlist, name='wishlist'),
    path('cart/', views.cart, name='cart'),
]
