from django.shortcuts import render, get_object_or_404
from django.db.models import Q
from .models import Product, Category

def home(request):
    products = Product.objects.all()[:8]
    categories = Category.objects.all()
    discount_products = Product.objects.filter(discount_price__isnull=False)[:4]
    context = {
        'products': products,
        'categories': categories,
        'discount_products': discount_products,
    }
    return render(request, 'index.html', context)

def product_list(request, category_slug=None):
    categories = Category.objects.all()
    products = Product.objects.all()
    category = None

    if category_slug:
        category = get_object_or_404(Category, slug=category_slug)
        products = products.filter(category=category)

    context = {
        'products': products,
        'categories': categories,
        'category': category,
    }
    return render(request, 'product_list.html', context)

def product_detail(request, slug):
    product = get_object_or_404(Product, slug=slug)
    # Get related products (same category, excluding current)
    related_products = Product.objects.filter(category=product.category).exclude(id=product.id)[:4]
    
    context = {
        'product': product,
        'related_products': related_products,
    }
    return render(request, 'product_detail.html', context)

def search(request):
    query = request.GET.get('q')
    products = []
    if query:
        products = Product.objects.filter(
            Q(name__icontains=query) | Q(description__icontains=query)
        )
    context = {
        'products': products,
        'query': query,
    }
    return render(request, 'product_list.html', context) # Reusing product list for search results

def contact(request):
    return render(request, 'contact.html')

def about(request):
    return render(request, 'about.html')

def discounts(request):
    # Fetch products that have a discount_price set
    products = Product.objects.filter(discount_price__isnull=False)
    return render(request, 'discounts.html', {'products': products})

def wishlist(request):
    # Retrieve all products to let JS filter them based on localStorage
    products = Product.objects.all()
    return render(request, 'wishlist.html', {'products': products})

def cart(request):
    # Retrieve all products for JS filtering
    products = Product.objects.all()
    return render(request, 'cart.html', {'products': products})
