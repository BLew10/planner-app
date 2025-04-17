"use client"

import React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface ActionModalProps {
  isOpen: boolean;
  closeModal: () => void;
  onAction: () => void;
  title?: string;
  text?: string;
  actionText?: string;
}

export function ActionModalComponent({
  isOpen,
  closeModal,
  title = "Title" ,
  text = "Lorem Ipsum",
  onAction,
  actionText = "Confirm",
}: ActionModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent className="sm:max-w-[425px]">
        {title && (
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
        )}
        {text && <DialogDescription>{text}</DialogDescription>}
        <DialogFooter className="sm:justify-start">
          <Button type="submit" onClick={onAction}>
            {actionText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}