"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => {
  const scrollRef = React.useRef<HTMLDivElement>(null)
  // True while columns are still hidden to the right of the viewport, i.e. while a
  // right-pinned column is actually overlaying content. Drives the pinned column's shadow.
  const [isOverflowingRight, setIsOverflowingRight] = React.useState(false)

  React.useEffect(() => {
    const scrollEl = scrollRef.current
    if (!scrollEl) return

    // 1px tolerance so subpixel rounding at the end of the scroll range doesn't
    // leave the shadow stuck on.
    const update = () =>
      setIsOverflowingRight(
        scrollEl.scrollWidth - scrollEl.clientWidth - scrollEl.scrollLeft > 1
      )

    update()
    scrollEl.addEventListener("scroll", update, { passive: true })

    // Watch both the viewport and the table itself: column visibility toggles and
    // data changes resize the table without resizing its container.
    const observer = new ResizeObserver(update)
    observer.observe(scrollEl)
    if (scrollEl.firstElementChild) observer.observe(scrollEl.firstElementChild)

    return () => {
      scrollEl.removeEventListener("scroll", update)
      observer.disconnect()
    }
  }, [])

  return (
    <div
      ref={scrollRef}
      data-overflow-right={isOverflowingRight ? "true" : "false"}
      className="group/table-scroll relative w-full overflow-auto"
    >
      <table
        ref={ref}
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      />
    </div>
  )
})
Table.displayName = "Table"

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props} />
))
TableHeader.displayName = "TableHeader"

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props}
  />
))
TableBody.displayName = "TableBody"

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
      className
    )}
    {...props}
  />
))
TableFooter.displayName = "TableFooter"

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement> & { noHoverState?: boolean }
>(({ className, noHoverState = false, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      // `group/row` lets pinned cells mirror the row's hover/selected state, which they
      // otherwise hide behind their own opaque background.
      "group/row border-b transition-colors even:bg-amber-100/70 data-[state=selected]:bg-muted",
      noHoverState ? "" : "hover:bg-muted/50",
      className
    )}
    {...props}
  />
))
TableRow.displayName = "TableRow"

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-10 px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
      className
    )}
    {...props}
  />
))
TableHead.displayName = "TableHead"

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      "p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
      className
    )}
    {...props}
  />
))
TableCell.displayName = "TableCell"

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-4 text-sm text-muted-foreground", className)}
    {...props}
  />
))
TableCaption.displayName = "TableCaption"

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
