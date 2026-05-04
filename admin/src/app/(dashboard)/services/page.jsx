"use client";

import { closestCenter } from "@dnd-kit/core";
import { useServices } from "@/hooks/useServices";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ServiceList } from "@/components/services/ServiceList";
import { ServiceFormModal } from "@/components/services/ServiceFormModal";
import { ToggleServiceModal } from "@/components/services/ToggleServiceModal";
import { DeleteServiceModal } from "@/components/services/DeleteServiceModal";
import { Plus, Search } from "lucide-react";
import { TableRowsSkeleton } from "@/components/skeletons";

export default function ServicesPage() {
  const {
    displayServices, filteredServices, orderedServices,
    loading, search, setSearch, showActiveOnly, setShowActiveOnly,
    isDraggable, sensors,
    showCreateModal, setShowCreateModal,
    showEditModal, setShowEditModal,
    showToggleModal, setShowToggleModal,
    showDeleteModal, setShowDeleteModal,
    selectedService, actionLoading, formData, setFormData,
    openCreateModal, openEditModal, openToggleModal, openDeleteModal,
    handleCreate, handleUpdate, confirmToggle, confirmDelete,
    handleDragEnd,
  } = useServices();

  const dndProps = { sensors, collisionDetection: closestCenter, onDragEnd: handleDragEnd };

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-momcha-text-dark">Services</h1>
          <p className="text-sm text-momcha-text-light">Kelola service yang ditawarkan</p>
        </div>
        <Button
          onClick={openCreateModal}
          className="w-full sm:w-auto bg-momcha-coral hover:bg-momcha-brown text-white text-sm h-9"
        >
          <Plus size={16} className="mr-2" /> Tambah Service
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-momcha-peach">
        <CardContent className="pt-4 lg:pt-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-momcha-text-light" size={16} />
              <Input
                placeholder="Cari service..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
            </div>
            <Button
              variant={showActiveOnly ? "default" : "outline"}
              onClick={() => setShowActiveOnly(!showActiveOnly)}
              className={`h-9 text-sm ${showActiveOnly ? "bg-momcha-coral hover:bg-momcha-brown" : ""}`}
            >
              {showActiveOnly ? "Semua Service" : "Aktif Saja"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* List */}
      <Card className="border-momcha-peach">
        <CardContent className="p-0">
          {loading ? (
            <TableRowsSkeleton rows={4} />
          ) : displayServices.length === 0 ? (
            <div className="text-center py-12 text-momcha-text-light">
              <p className="text-sm">Tidak ada service yang ditemukan</p>
            </div>
          ) : (
            <ServiceList
              services={orderedServices}
              filtered={filteredServices}
              isDraggable={isDraggable}
              dndProps={dndProps}
              onEdit={openEditModal}
              onToggle={openToggleModal}
              onDelete={openDeleteModal}
            />
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <ServiceFormModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleCreate}
        formData={formData}
        onFormChange={setFormData}
        loading={actionLoading}
        mode="create"
      />
      <ServiceFormModal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleUpdate}
        formData={formData}
        onFormChange={setFormData}
        loading={actionLoading}
        mode="edit"
      />
      <ToggleServiceModal
        open={showToggleModal}
        onClose={() => setShowToggleModal(false)}
        onConfirm={confirmToggle}
        service={selectedService}
        loading={actionLoading}
      />
      <DeleteServiceModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        service={selectedService}
        loading={actionLoading}
      />
    </div>
  );
}
