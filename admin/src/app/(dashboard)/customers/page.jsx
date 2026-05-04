"use client";

import { useCustomers } from "@/hooks/useCustomers";
import { formatCurrency, formatDate } from "@/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Pagination } from "@/components/ui/Pagination";
import { EditCustomerModal } from "@/components/customers/EditCustomerModal";
import { DeleteCustomerModal } from "@/components/customers/DeleteCustomerModal";
import {
  Search,
  User,
  Phone,
  Mail,
  MapPin,
  ShoppingBag,
  DollarSign,
  Edit,
  Trash2,
} from "lucide-react";
import { TableRowsSkeleton } from "@/components/skeletons";

export default function CustomersPage() {
  const {
    customers, loading,
    search, setSearch,
    page, setPage,
    totalPages, totalCustomers, limit,
    showEditModal, setShowEditModal,
    showDeleteModal, setShowDeleteModal,
    selectedCustomer, actionLoading,
    formData, setFormData,
    openEditModal, openDeleteModal,
    handleUpdate, handleDelete,
  } = useCustomers();

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl lg:text-2xl font-bold text-momcha-text-dark">Customers</h1>
        <p className="text-sm text-momcha-text-light">Kelola data customer</p>
      </div>

      {/* Search */}
      <Card className="border-momcha-peach">
        <CardContent className="pt-4 lg:pt-6">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-momcha-text-light"
              size={18}
            />
            <Input
              placeholder="Cari customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* List */}
      <Card className="border-momcha-peach">
        <CardContent className="p-0">
          {loading ? (
            <TableRowsSkeleton />
          ) : customers.length === 0 ? (
            <div className="text-center py-12 text-momcha-text-light">
              <p className="text-sm">Tidak ada customer yang ditemukan</p>
            </div>
          ) : (
            <>
              {/* Mobile */}
              <div className="lg:hidden divide-y divide-momcha-peach">
                {customers.map((customer) => (
                  <div key={customer.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-momcha-peach flex items-center justify-center shrink-0">
                          <User size={18} className="text-momcha-brown" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-momcha-text-dark truncate">
                            {customer.name}
                          </p>
                          <p className="text-xs text-momcha-text-light">
                            {formatDate(customer.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(customer)}
                          className="text-blue-600 hover:bg-blue-50 h-8 w-8 p-0"
                        >
                          <Edit size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDeleteModal(customer)}
                          className="text-red-600 hover:bg-red-50 h-8 w-8 p-0"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-1.5 text-sm">
                      <div className="flex items-center gap-2 text-momcha-text-dark">
                        <Phone size={14} className="text-momcha-text-light shrink-0" />
                        <span className="truncate">{customer.phone}</span>
                      </div>
                      {customer.email && (
                        <div className="flex items-center gap-2 text-momcha-text-light">
                          <Mail size={14} className="shrink-0" />
                          <span className="truncate">{customer.email}</span>
                        </div>
                      )}
                      {customer.address && (
                        <div className="flex items-start gap-2 text-momcha-text-light">
                          <MapPin size={14} className="mt-0.5 shrink-0" />
                          <span className="text-xs line-clamp-2">{customer.address}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-momcha-peach">
                      <div className="flex items-center gap-1.5 text-xs text-momcha-text-dark">
                        <ShoppingBag size={12} className="text-momcha-text-light shrink-0" />
                        <span>{customer.total_orders || 0} orders</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-medium text-momcha-text-dark">
                        <DollarSign size={12} className="text-green-600" />
                        <span>{formatCurrency(customer.total_spent || 0)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-momcha-cream border-b border-momcha-peach">
                    <tr>
                      {["Customer", "Kontak", "Alamat", "Total Orders", "Total Spent", "Aksi"].map((h, i) => (
                        <th
                          key={h}
                          className={`px-6 py-3 text-xs font-medium text-momcha-text-dark ${i === 5 ? "text-right" : "text-left"}`}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-momcha-peach">
                    {customers.map((customer) => (
                      <tr key={customer.id} className="hover:bg-momcha-cream transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-momcha-peach flex items-center justify-center shrink-0">
                              <User size={18} className="text-momcha-brown" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-momcha-text-dark">
                                {customer.name}
                              </p>
                              <p className="text-xs text-momcha-text-light">
                                Bergabung {formatDate(customer.created_at)}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-momcha-text-dark">
                              <Phone size={14} className="text-momcha-text-light shrink-0" />
                              {customer.phone}
                            </div>
                            {customer.email && (
                              <div className="flex items-center gap-2 text-sm text-momcha-text-light">
                                <Mail size={14} />
                                {customer.email}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {customer.address ? (
                            <div className="flex items-start gap-2 text-sm text-momcha-text-light max-w-xs">
                              <MapPin size={14} className="mt-0.5 shrink-0" />
                              <span className="line-clamp-2">{customer.address}</span>
                            </div>
                          ) : (
                            <span className="text-sm text-momcha-text-light">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-momcha-text-dark">
                            <ShoppingBag size={14} className="text-momcha-text-light shrink-0" />
                            {customer.total_orders || 0} orders
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm font-medium text-momcha-text-dark">
                            <DollarSign size={14} className="text-green-600" />
                            {formatCurrency(customer.total_spent || 0)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditModal(customer)}
                              className="text-blue-600 hover:bg-blue-50"
                            >
                              <Edit size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openDeleteModal(customer)}
                              className="text-red-600 hover:bg-red-50"
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs sm:text-sm text-momcha-text-light">
            {(page - 1) * limit + 1} –{" "}
            {Math.min(page * limit, totalCustomers)} dari {totalCustomers}
          </p>
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}

      {/* Modals */}
      <EditCustomerModal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleUpdate}
        formData={formData}
        onFormChange={setFormData}
        loading={actionLoading}
      />
      <DeleteCustomerModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        customer={selectedCustomer}
        loading={actionLoading}
      />
    </div>
  );
}
