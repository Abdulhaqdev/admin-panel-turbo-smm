// CategoryPage.tsx
"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, ChevronDown, ChevronUp, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Modal } from "@/components/ui/modal";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getCategories, createCategory, updateCategory, deleteCategory } from "@/lib/apiservice";
import SocialIcon from "@/components/SocialIcon"; // Yangi komponent

interface Category {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  icon?: string; // Yangi xususiyat
}

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Ijtimoiy tarmoqlar ro'yxati
const socialPlatforms = [
  "Instagram",
  "Facebook",
  "Twitter",
  "Spotify",
  "TikTok",
  "LinkedIn",
  "Google",
  "Telegram",
  "Discord",
  "Snapchat",
  "Twitch",
];

export default function CategoryPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [sortField, setSortField] = useState<keyof Category>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const itemsPerPage = 10;

  const [newCategory, setNewCategory] = useState<Omit<Category, "id" | "created_at" | "updated_at">>({
    name: "",
    description: "",
    is_active: true,
    icon: "", // Yangi xususiyat
  });

  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const offset = (currentPage - 1) * itemsPerPage;
        const data: PaginatedResponse<Category> = await getCategories(itemsPerPage, offset);
        const normalizedData = data.results.map((cat) => ({
          ...cat,
          description: cat.description ?? "",
          icon: cat.icon ?? "", // Ikonka bo'lmasa bo'sh qator
        }));
        setCategories(normalizedData);
        setTotalCount(data.count);
      } catch (err) {
        setError((err as { message?: string }).message || "Kategoriyalarni yuklashda xato yuz berdi");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [currentPage]);

  const handleSort = (field: keyof Category) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedCategories = [...categories].sort((a, b) => {
    if (sortField === "is_active") {
      return sortDirection === "asc"
        ? Number(a.is_active) - Number(b.is_active)
        : Number(b.is_active) - Number(a.is_active);
    }
    const aField = a[sortField] ?? "";
    const bField = b[sortField] ?? "";
    if (aField < bField) return sortDirection === "asc" ? -1 : 1;
    if (aField > bField) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const handleAddCategory = async () => {
    try {
      const createdCategory = await createCategory(newCategory);
      setCategories([...categories, { ...createdCategory, description: createdCategory.description ?? "",  }]);
      setNewCategory({ name: "", description: "", is_active: true});
      setAddDialogOpen(false);
      setCurrentPage(1);
    } catch (err) {
      setError((err as { message?: string }).message || "Kategoriya qo‘shishda xato yuz berdi");
    }
  };

  const handleUpdateCategory = async () => {
    if (!editCategory) return;
    try {
      const updatedCategory = await updateCategory(editCategory.id, editCategory);
      setCategories(
        categories.map((category) =>
          category.id === updatedCategory.id
            ? { ...updatedCategory, description: updatedCategory.description ?? "", icon: updatedCategory.icon ?? "" }
            : category
        )
      );
      setEditCategory(null);
      setEditDialogOpen(false);
    } catch (err) {
      setError((err as { message?: string }).message || "Kategoriyani yangilashda xato yuz berdi");
    }
  };

  const handleDeleteCategory = async () => {
    if (categoryToDelete === null) return;
    try {
      await deleteCategory(categoryToDelete);
      setCategories(categories.filter((category) => category.id !== categoryToDelete));
      setCategoryToDelete(null);
      setDeleteDialogOpen(false);
      if (categories.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (err) {
      setError((err as { message?: string }).message || "Kategoriyani o‘chirishda xato yuz berdi");
    }
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <main className="flex-1 p-4 md:p-10">
          <div className="mx-auto max-w-7xl flex items-center justify-center min-h-[90vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
        <div className="flex items-center gap-2">
          <Button onClick={() => setAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manage Categories</CardTitle>
          <CardDescription>Create, edit, and manage categories for your services.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("name")}>
                    <div className="flex items-center gap-1">
                      Name
                      {sortField === "name" &&
                        (sortDirection === "asc" ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        ))}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("description")}>
                    <div className="flex items-center gap-1">
                      Description
                      {sortField === "description" &&
                        (sortDirection === "asc" ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        ))}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("is_active")}>
                    <div className="flex items-center gap-1">
                      Status
                      {sortField === "is_active" &&
                        (sortDirection === "asc" ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        ))}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("created_at")}>
                    <div className="flex items-center gap-1">
                      Created At
                      {sortField === "created_at" &&
                        (sortDirection === "asc" ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        ))}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("updated_at")}>
                    <div className="flex items-center gap-1">
                      Updated At
                      {sortField === "updated_at" &&
                        (sortDirection === "asc" ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        ))}
                    </div>
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedCategories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <SocialIcon iconName={category.icon} className="h-5 w-5" />
                        <span>{category.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{category.description || "No description"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-2.5 w-2.5 rounded-full ${category.is_active ? "bg-green-500" : "bg-red-500"}`}
                        />
                        <span>{category.is_active ? "Active" : "Inactive"}</span>
                      </div>
                    </TableCell>
                    <TableCell>{new Date(category.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(category.updated_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditCategory(category);
                            setEditDialogOpen(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setCategoryToDelete(category.id);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {sortedCategories.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No categories found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(currentPage - 1);
                    }}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      href="#"
                      isActive={currentPage === page}
                      onClick={(e) => {
                        e.preventDefault();
                        handlePageChange(page);
                      }}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                {totalPages > 5 && <PaginationItem><PaginationEllipsis /></PaginationItem>}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(currentPage + 1);
                    }}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </CardContent>
      </Card>

      {/* Add Category Dialog */}
      <Modal
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        title="Add Category"
        description="Create a new category for your services."
        footer={
          <>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddCategory}>Add Category</Button>
          </>
        }
      >
        <div className="grid gap-4 p-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={newCategory.name}
              onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="icon">Icon</Label>
            <Select
              value={newCategory.icon}
              onValueChange={(value) => setNewCategory({ ...newCategory, icon: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an icon" />
              </SelectTrigger>
              <SelectContent>
                {socialPlatforms.map((platform) => (
                  <SelectItem key={platform} value={platform.toLowerCase()}>
                    <div className="flex items-center gap-2">
                      <SocialIcon iconName={platform.toLowerCase()} className="h-5 w-5" />
                      <span>{platform}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={newCategory.description}
              onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
            />
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="is_active">Active</Label>
            <Switch
              id="is_active"
              checked={newCategory.is_active}
              onCheckedChange={(checked) => setNewCategory({ ...newCategory, is_active: checked })}
            />
          </div>
        </div>
      </Modal>

      {/* Edit Category Dialog */}
      <Modal
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        title="Edit Category"
        description="Update the category details."
        footer={
          <>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateCategory}>Update Category</Button>
          </>
        }
      >
        {editCategory && (
          <div className="grid gap-4 p-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={editCategory.name}
                onChange={(e) => setEditCategory({ ...editCategory, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-icon">Icon</Label>
              <Select
                value={editCategory.icon}
                onValueChange={(value) => setEditCategory({ ...editCategory, icon: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an icon" />
                </SelectTrigger>
                <SelectContent>
                  {socialPlatforms.map((platform) => (
                    <SelectItem key={platform} value={platform.toLowerCase()}>
                      <div className="flex items-center gap-2">
                        <SocialIcon iconName={platform.toLowerCase()} className="h-5 w-5" />
                        <span>{platform}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={editCategory.description || ""}
                onChange={(e) => setEditCategory({ ...editCategory, description: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="edit-is_active">Active</Label>
              <Switch
                id="edit-is_active"
                checked={editCategory.is_active}
                onCheckedChange={(checked) => setEditCategory({ ...editCategory, is_active: checked })}
              />
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Dialog */}
      <Modal
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Category"
        children={null}
        description="Are you sure you want to delete this category? This action cannot be undone."
        footer={
          <>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteCategory}>
              Delete
            </Button>
          </>
        }
      />
    </div>
  );
}