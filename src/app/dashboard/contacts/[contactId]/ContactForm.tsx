"use client";

import React, { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { COUNTRIES, STATES, CATEGORIES } from "@/lib/constants";
import { useAddressBooks } from "@/hooks/address-book/useAddressBooks";
import { useContact } from "@/hooks/contact/useContact";
import { ContactModel } from "@/lib/models/contact";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";

const formSchema = z.object({
  customerSince: z.string().optional(),
  notes: z.string().optional(),
  category: z.string(),
  webAddress: z.string().url().optional().or(z.literal("")),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().optional(),
  altContactFirstName: z.string().optional(),
  altContactLastName: z.string().optional(),
  salutation: z.string().optional(),
  company: z.string().min(1, "Company is required"),
  extension: z.string().optional(),
  phone: z.string().optional(),
  altPhone: z.string().optional(),
  fax: z.string().optional(),
  email: z.string().email("Invalid email address"),
  cellPhone: z.string().optional(),
  homePhone: z.string().optional(),
  address: z.string().optional(),
  address2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  zip: z.string().optional(),
  addressBooksIds: z.array(z.string()).optional(),
});

export type ContactFormValues = z.infer<typeof formSchema>;

interface ContactFormProps {
  id: string | null;
}

const DEFAULT_FORM_VALUES: ContactFormValues = {
  customerSince: "",
  notes: "",
  category: "0",
  webAddress: "",
  firstName: "",
  lastName: "",
  altContactFirstName: "",
  altContactLastName: "",
  salutation: "",
  company: "",
  extension: "",
  phone: "",
  altPhone: "",
  fax: "",
  email: "",
  cellPhone: "",
  homePhone: "",
  address: "",
  address2: "",
  city: "",
  state: "",
  country: "",
  zip: "",
  addressBooksIds: [],
};

const mapContactToFormValues = (
  contact: Partial<ContactModel> | null
): ContactFormValues => {
  if (!contact) return DEFAULT_FORM_VALUES;

  console.log(contact.category);
  return {
    customerSince: contact.customerSince || "",
    notes: contact.notes || "",
    category: contact.category || "0",
    webAddress: contact.webAddress || "",
    firstName: contact.contactContactInformation?.firstName || "",
    lastName: contact.contactContactInformation?.lastName || "",
    altContactFirstName:
      contact.contactContactInformation?.altContactFirstName || "",
    altContactLastName:
      contact.contactContactInformation?.altContactLastName || "",
    salutation: contact.contactContactInformation?.salutation || "",
    company: contact.contactContactInformation?.company || "",
    extension: contact.contactTelecomInformation?.extension || "",
    phone: contact.contactTelecomInformation?.phone || "",
    altPhone: contact.contactTelecomInformation?.altPhone || "",
    fax: contact.contactTelecomInformation?.fax || "",
    email: contact.contactTelecomInformation?.email || "",
    cellPhone: contact.contactTelecomInformation?.cellPhone || "",
    homePhone: contact.contactTelecomInformation?.homePhone || "",
    address: contact.contactAddress?.address || "",
    address2: contact.contactAddress?.address2 || "",
    city: contact.contactAddress?.city || "",
    state: contact.contactAddress?.state || "",
    country: contact.contactAddress?.country || "",
    zip: contact.contactAddress?.zip || "",
    addressBooksIds: contact.addressBooks?.map((book) => book.id) || [],
  };
};

export default function ContactForm({ id }: ContactFormProps) {
  const { addressBooks } = useAddressBooks({ includeAllOption: false });
  const { saveContact, isLoading, contact } = useContact({ id: id || "" });
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: DEFAULT_FORM_VALUES,
  });

  useEffect(() => {
    form.reset(mapContactToFormValues(contact));
  }, [contact, form, form.reset]);

  if (isLoading) {
    return (
      <Card className="w-full max-w-7xl mx-auto my-10">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            <Skeleton className="h-8 w-48" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {/* Telecom Section */}
            <div className="space-y-4">
              <Skeleton className="h-6 w-40" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-9 w-full" />
                  </div>
                ))}
              </div>
            </div>

            {/* Address Books Section */}
            <div className="space-y-4">
              <Skeleton className="h-6 w-40" />
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Information Section */}
            <div className="space-y-4">
              <Skeleton className="h-6 w-40" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-9 w-full" />
                  </div>
                ))}
              </div>
            </div>

            {/* Address Information Section */}
            <div className="space-y-4">
              <Skeleton className="h-6 w-40" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-9 w-full" />
                  </div>
                ))}
              </div>
            </div>

            {/* Other Section */}
            <div className="space-y-4">
              <Skeleton className="h-6 w-40" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-9 w-full" />
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-32 w-full" />
              </div>
            </div>

            <Skeleton className="h-9 w-24" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-7xl mx-auto my-10">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          {id ? "Edit" : "Add"} Contact
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(saveContact)} className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Telecom Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="123-456-7890" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="extension"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Extension</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="altPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alt Phone Number</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fax"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fax</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cellPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cell</FormLabel>
                      <FormControl>
                        <Input placeholder="123-456-7890" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="homePhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Home Phone</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="webAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Web Address</FormLabel>
                      <FormControl>
                        <Input
                          type="url"
                          placeholder="https://example.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-2">
                        <FormLabel required>Email</FormLabel>
                        <TooltipProvider delayDuration={0}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info 
                                className="h-4 w-4 text-muted-foreground cursor-pointer" 
                                role="button"
                                tabIndex={0}
                              />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Verify the email address is valid</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="john@example.com"
                          required
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Address Books</h2>
              {addressBooks && addressBooks.length > 0 ? (
                <FormField
                  control={form.control}
                  name="addressBooksIds"
                  render={() => (
                    <FormItem>
                      {addressBooks.map((book) => (
                        <FormField
                          key={book.id}
                          control={form.control}
                          name="addressBooksIds"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={book.id}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(
                                      book.id || ""
                                    )}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([
                                            ...(field.value || []),
                                            book.id,
                                          ])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== book.id
                                            )
                                          );
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {book.name}
                                </FormLabel>
                              </FormItem>
                            );
                          }}
                        />
                      ))}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <p>No address books found</p>
              )}
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Contact Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>Contact First Name</FormLabel>
                      <FormControl>
                        <Input required {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Last Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="altContactFirstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alt Contact First Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="altContactLastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alt Contact Last Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="salutation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Salutation</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>Company</FormLabel>
                      <FormControl>
                        <Input required {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Address Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Street Address 1</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address Line 2</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a state" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {STATES.map((state) => (
                            <SelectItem key={state.value} value={state.value}>
                              {state.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="zip"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Zip Code</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a country" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {COUNTRIES.map((country) => (
                            <SelectItem
                              key={country.value}
                              value={country.value}
                            >
                              {country.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Other</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="customerSince"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer Since</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CATEGORIES.map((category) => (
                            <SelectItem
                              key={category.value}
                              value={category.value}
                            >
                              {category.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add any additional notes here."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
