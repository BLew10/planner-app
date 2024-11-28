"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ButtonProps } from "@/components/ui/button";

interface ActionButtonWithModalProps extends ButtonProps {
  triggerText: string;
  modalTitle?: string;
  modalText?: string;
  actionText?: string;
  onAction: () => void;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  className?: string;
}

export default function ActionButtonWithModal({
  triggerText,
  modalTitle = "Title",
  modalText = "Lorem Ipsum",
  actionText = "Confirm",
  onAction,
  variant = "default",
  size = "default",
  className,
  ...buttonProps
}: ActionButtonWithModalProps) {
  const [open, setOpen] = React.useState(false);

  const handleAction = () => {
    onAction();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={className}
          {...buttonProps}
        >
          {triggerText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        {modalTitle && (
          <DialogHeader>
            <DialogTitle>{modalTitle}</DialogTitle>
          </DialogHeader>
        )}
        {modalText && <DialogDescription>{modalText}</DialogDescription>}
        <DialogFooter className="sm:justify-start">
          <Button type="submit" onClick={handleAction} variant={variant}>
            {actionText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
