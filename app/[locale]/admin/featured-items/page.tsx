"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
    Modal,
    ModalContent,
    ModalHeader
} from "@heroui/react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Plus,
    Edit,
    Trash2,
    Star,
    Eye,
    EyeOff,
    ArrowUp,
    ArrowDown,
    Loader2,
    Search,
    Package
} from "lucide-react";
import { toast } from "sonner";
import { UniversalPagination } from "@/components/universal-pagination";
import { ItemData } from "@/lib/types/item";
import Image from "next/image";

interface FeaturedItem {
  id: string;
  itemSlug: string;
  itemName: string;
  itemIconUrl?: string;
  itemCategory?: string;
  itemDescription?: string;
  featuredOrder: number;
  featuredUntil?: string;
  isActive: boolean;
  featuredBy: string;
  featuredAt: string;
  createdAt: string;
  updatedAt: string;
}

interface FeaturedItemsResponse {
  success: boolean;
  data: FeaturedItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export default function AdminFeaturedItemsPage() {
  const [featuredItems, setFeaturedItems] = useState<FeaturedItem[]>([]);
  const [allItems, setAllItems] = useState<ItemData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [showActiveOnly, setShowActiveOnly] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedItem, setSelectedItem] = useState<FeaturedItem | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    itemSlug: "",
    itemName: "",
    itemIconUrl: "",
    itemCategory: "",
    itemDescription: "",
    featuredOrder: 0,
    featuredUntil: "",
    isActive: true,
  });

  const fetchFeaturedItems = useCallback(async (page: number = 1) => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/admin/featured-items?page=${page}&limit=10&active=${showActiveOnly}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch featured items');
      }
      
      const data: FeaturedItemsResponse = await response.json();
      
      if (data.success) {
        setFeaturedItems(data.data);
        setCurrentPage(data.pagination.page);
        setTotalPages(data.pagination.totalPages);
        setTotalItems(data.pagination.total);
      }
    } catch (error) {
      console.error('Error fetching featured items:', error);
      toast.error('Failed to fetch featured items');
    } finally {
      setIsLoading(false);
    }
  }, [showActiveOnly]);

  const fetchAllItems = async () => {
    try {
      const response = await fetch('/api/admin/items?page=1&limit=1000');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAllItems(data.items);
        }
      }
    } catch (error) {
      console.error('Error fetching all items:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await fetchFeaturedItems();
      await fetchAllItems();
    };
    fetchData();
  }, [showActiveOnly, fetchFeaturedItems]);

  const handleAddFeatured = () => {
    setSelectedItem(null);
    setFormData({
      itemSlug: "",
      itemName: "",
      itemIconUrl: "",
      itemCategory: "",
      itemDescription: "",
      featuredOrder: 0,
      featuredUntil: "",
      isActive: true,
    });
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const handleEditFeatured = (item: FeaturedItem) => {
    setSelectedItem(item);
    setFormData({
      itemSlug: item.itemSlug,
      itemName: item.itemName,
      itemIconUrl: item.itemIconUrl || "",
      itemCategory: item.itemCategory || "",
      itemDescription: item.itemDescription || "",
      featuredOrder: item.featuredOrder,
      featuredUntil: item.featuredUntil ? new Date(item.featuredUntil).toISOString().slice(0, 16) : "",
      isActive: item.isActive,
    });
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleItemSelect = (itemSlug: string) => {
    const item = allItems.find(i => i.slug === itemSlug);
    if (item) {
      setFormData(prev => ({
        ...prev,
        itemSlug: item.slug,
        itemName: item.name,
        itemIconUrl: item.icon_url || "",
        itemCategory: Array.isArray(item.category) ? item.category[0] : item.category || "",
        itemDescription: item.description,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = isEditMode && selectedItem 
        ? `/api/admin/featured-items/${selectedItem.id}`
        : '/api/admin/featured-items';
      
      const method = isEditMode ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(
          isEditMode 
            ? 'Featured item updated successfully' 
            : 'Item featured successfully'
        );
        setIsModalOpen(false);
        fetchFeaturedItems(currentPage);
      } else {
        toast.error(data.error || 'Failed to save featured item');
      }
    } catch (error) {
      console.error('Error saving featured item:', error);
      toast.error('Failed to save featured item');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveFeatured = async (id: string) => {
    if (!confirm('Are you sure you want to remove this item from featured?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/featured-items/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Item removed from featured');
        fetchFeaturedItems(currentPage);
      } else {
        toast.error(data.error || 'Failed to remove featured item');
      }
    } catch (error) {
      console.error('Error removing featured item:', error);
      toast.error('Failed to remove featured item');
    }
  };

  const handleUpdateOrder = async (id: string, newOrder: number) => {
    try {
      const response = await fetch(`/api/admin/featured-items/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ featuredOrder: newOrder }),
      });

      if (response.ok) {
        fetchFeaturedItems(currentPage);
      }
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  const filteredItems = featuredItems.filter(item =>
    item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.itemSlug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Featured Items Management</h1>
          <p className="text-muted-foreground">
            Manage which items appear as featured on the homepage
          </p>
        </div>
        <Button onClick={handleAddFeatured} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Featured Item
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Featured</p>
                <p className="text-2xl font-bold">{totalItems}</p>
              </div>
              <Star className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">
                  {featuredItems.filter(item => item.isActive).length}
                </p>
              </div>
              <Eye className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Inactive</p>
                <p className="text-2xl font-bold">
                  {featuredItems.filter(item => !item.isActive).length}
                </p>
              </div>
              <EyeOff className="w-8 h-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Available Items</p>
                <p className="text-2xl font-bold">{allItems.length}</p>
              </div>
              <Package className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search featured items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="active-only"
                checked={showActiveOnly}
                onCheckedChange={setShowActiveOnly}
              />
              <Label htmlFor="active-only">Active only</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Featured Items List */}
      <Card>
        <CardHeader>
          <CardTitle>Featured Items</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No featured items found
            </div>
          ) : (
            <div className="space-y-4">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleUpdateOrder(item.id, item.featuredOrder - 1)}
                        disabled={item.featuredOrder <= 0}
                      >
                        <ArrowUp className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleUpdateOrder(item.id, item.featuredOrder + 1)}
                      >
                        <ArrowDown className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    {item.itemIconUrl && (
                      <Image
                        src={item.itemIconUrl}
                        alt={item.itemName}
                        width={48}
                        height={48}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    )}
                    
                    <div>
                      <h3 className="font-semibold">{item.itemName}</h3>
                      <p className="text-sm text-muted-foreground">
                        {item.itemSlug} • Order: {item.featuredOrder}
                      </p>
                      {item.featuredUntil && (
                        <p className="text-xs text-muted-foreground">
                          Featured until: {new Date(item.featuredUntil).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge variant={item.isActive ? "default" : "secondary"}>
                      {item.isActive ? "Active" : "Inactive"}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditFeatured(item)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveFeatured(item.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
            <UniversalPagination
              page={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
      )}

      {/* Add/Edit Modal */}
      <Modal isOpen={isModalOpen} onOpenChange={setIsModalOpen}>
        <ModalContent className="max-w-2xl">
          <ModalHeader>
            <h2 className="text-xl font-semibold">
              {isEditMode ? 'Edit Featured Item' : 'Add Featured Item'}
            </h2>
          </ModalHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="itemSlug">Select Item</Label>
                <Select 
                  selectedKeys={formData.itemSlug ? [formData.itemSlug] : []}
                  onSelectionChange={(keys) => {
                    const selectedKey = Array.from(keys)[0] as string;
                    if (selectedKey) {
                      handleItemSelect(selectedKey);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue>
                      {formData.itemSlug ? allItems.find(item => item.slug === formData.itemSlug)?.name : "Choose an item to feature"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {allItems.map((item) => (
                      <SelectItem key={item.slug} value={item.slug}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="featuredOrder">Display Order</Label>
                <Input
                  id="featuredOrder"
                  type="number"
                  value={formData.featuredOrder}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    featuredOrder: parseInt(e.target.value) || 0
                  }))}
                  min="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="itemName">Item Name</Label>
                <Input
                  id="itemName"
                  value={formData.itemName}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    itemName: e.target.value
                  }))}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="itemCategory">Category</Label>
                <Input
                  id="itemCategory"
                  value={formData.itemCategory}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    itemCategory: e.target.value
                  }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="itemIconUrl">Icon URL</Label>
              <Input
                id="itemIconUrl"
                value={formData.itemIconUrl}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  itemIconUrl: e.target.value
                }))}
              />
            </div>

            <div>
              <Label htmlFor="itemDescription">Description</Label>
              <Textarea
                id="itemDescription"
                value={formData.itemDescription}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  itemDescription: e.target.value
                }))}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="featuredUntil">Featured Until (Optional)</Label>
                <Input
                  id="featuredUntil"
                  type="datetime-local"
                  value={formData.featuredUntil}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    featuredUntil: e.target.value
                  }))}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData(prev => ({
                    ...prev,
                    isActive: checked
                  }))}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {isEditMode ? 'Update' : 'Add'} Featured Item
              </Button>
            </div>
          </form>
        </ModalContent>
      </Modal>
    </div>
  );
}
