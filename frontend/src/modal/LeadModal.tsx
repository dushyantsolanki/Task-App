import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useState, useEffect } from "react";
import { XInputField } from "@/components/custom/XInputField";
import { Building, Globe, Layers, Mail, MapPin, Minus, Phone, Plus } from "lucide-react";

interface Lead {
    _id?: string;
    title: string;
    address?: string;
    city: string;
    postalCode?: string;
    state: string;
    countryCode: string;
    website?: string;
    phone?: string;
    categories: string[];
    domain?: string;
    emails: string[];
    phones: string[];
}

interface ModalFormProps {
    isOpen: boolean;
    onClose: () => void;
    initialValues?: Lead | null;
    handleAdd: (values: Lead, resetForm: () => void, onClose: () => void) => void
    handleEdit: (values: Lead, resetForm: () => void, onClose: () => void) => void
}

const LeadModal = ({ isOpen, onClose, initialValues, handleAdd,
    handleEdit }: ModalFormProps) => {
    const [emailInputs, setEmailInputs] = useState<string[]>(
        Array.isArray(initialValues?.emails) && initialValues.emails.length > 0 ? initialValues.emails : [""]
    );
    const [phoneInputs, setPhoneInputs] = useState<string[]>(
        Array.isArray(initialValues?.phones) && initialValues.phones.length > 0 ? initialValues.phones : [""]
    );
    const [categoryInputs, setCategoryInputs] = useState<string[]>(
        Array.isArray(initialValues?.categories) && initialValues.categories.length > 0 ? initialValues.categories : [""]
    );


    useEffect(() => {
        setEmailInputs(Array.isArray(initialValues?.emails) && initialValues.emails.length > 0 ? initialValues.emails : [""]);
        setPhoneInputs(Array.isArray(initialValues?.phones) && initialValues.phones.length > 0 ? initialValues.phones : [""]);
        setCategoryInputs(Array.isArray(initialValues?.categories) && initialValues.categories.length > 0 ? initialValues.categories : [""]);
    }, [initialValues]);

    const formik = useFormik({
        initialValues: {
            title: initialValues?.title || "",
            address: initialValues?.address || "",
            city: initialValues?.city || "",
            postalCode: initialValues?.postalCode || "",
            state: initialValues?.state || "",
            countryCode: initialValues?.countryCode || "",
            website: initialValues?.website || "",
            phone: initialValues?.phone || "",
            categories: Array.isArray(initialValues?.categories) && initialValues.categories.length > 0 ? initialValues.categories : [""],
            emails: Array.isArray(initialValues?.emails) && initialValues.emails.length > 0 ? initialValues.emails : [""],
            phones: Array.isArray(initialValues?.phones) && initialValues.phones.length > 0 ? initialValues.phones : [""],
        },
        validationSchema: Yup.object({
            title: Yup.string().required("Title is required"),
            city: Yup.string().required("City is required"),
            state: Yup.string().required("State is required"),
            countryCode: Yup.string().required("Country code is required"),
            website: Yup.string().url("Invalid URL format").optional(),
            phone: Yup.string().required("Phone is required"),
            categories: Yup.array()
                .of(Yup.string().required("Category cannot be empty"))
                .min(1, "At least one category is required"),
            emails: Yup.array()
                .of(Yup.string().email("Invalid email format").required("Email cannot be empty"))
                .min(1, "At least one email is required"),
            phones: Yup.array()
                .of(Yup.string().required("Phone cannot be empty"))
                .min(1, "At least one phone is required"),
        }),
        enableReinitialize: true,
        onSubmit: (values) => {

            if (!!initialValues) {
                handleEdit({
                    ...values,
                    emails: values.emails.filter((email) => email.trim() !== ""),
                    phones: values.phones.filter((phone) => phone.trim() !== ""),
                    categories: values.categories.filter((category) => category.trim() !== ""),
                }, formik.resetForm, onClose)
            }
            else {
                handleAdd({
                    ...values,
                    emails: values.emails.filter((email) => email.trim() !== ""),
                    phones: values.phones.filter((phone) => phone.trim() !== ""),
                    categories: values.categories.filter((category) => category.trim() !== ""),
                }, formik.resetForm, onClose)
            }

        },
    });

    const addField = (field: "emails" | "phones" | "categories") => {
        if (field === "emails") {
            setEmailInputs([...emailInputs, ""]);
            formik.setFieldValue("emails", [...formik.values.emails, ""]);
        } else if (field === "phones") {
            setPhoneInputs([...phoneInputs, ""]);
            formik.setFieldValue("phones", [...formik.values.phones, ""]);
        } else {
            setCategoryInputs([...categoryInputs, ""]);
            formik.setFieldValue("categories", [...formik.values.categories, ""]);
        }
    };

    const removeField = (field: "emails" | "phones" | "categories", index: number) => {
        if (field === "emails") {
            const newEmails = emailInputs.filter((_, i) => i !== index);
            setEmailInputs(newEmails);
            formik.setFieldValue("emails", newEmails);
        } else if (field === "phones") {
            const newPhones = phoneInputs.filter((_, i) => i !== index);
            setPhoneInputs(newPhones);
            formik.setFieldValue("phones", newPhones);
        } else {
            const newCategories = categoryInputs.filter((_, i) => i !== index);
            setCategoryInputs(newCategories);
            formik.setFieldValue("categories", newCategories);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="flex flex-col gap-0 p-0 max-h-[90vh] sm:max-h-[80vh] md:max-h-[70vh] lg:max-h-[70vh] w-full max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-4xl [&>button:last-child]:top-4">
                <DialogHeader className="contents space-y-0 text-left">
                    <DialogTitle className="border-b px-6 py-4 text-base">
                        {!!initialValues ? "Edit Lead" : "Create Lead"}
                        <p className="font-normal text-xs text-foreground">
                            {!!initialValues
                                ? "Update the lead details below."
                                : "Create a new lead by filling out the details."}
                        </p>
                    </DialogTitle>

                    <div className="overflow-y-auto scrollbar-hide">
                        <DialogDescription asChild>
                            <form
                                id="lead-form"
                                onSubmit={formik.handleSubmit}
                                className="px-6 py-4 grid grid-cols-1 md:grid-cols-2 gap-4"
                            >
                                <XInputField
                                    id="title"
                                    name="title"
                                    label="Title"
                                    type="text"
                                    icon={<Building className="h-5 w-5" />}
                                    className="h-11"
                                    placeholder="Task 123"
                                    value={formik.values.title}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={
                                        formik.touched.title &&
                                        (formik.errors.title as string)
                                    }
                                />
                                <XInputField
                                    id="address"
                                    name="address"
                                    label="Address"
                                    type="text"
                                    className="h-11"
                                    icon={<MapPin className="h-5 w-5" />}
                                    placeholder="123 Main St"
                                    value={formik.values.address}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={
                                        formik.touched.address &&
                                        (formik.errors.address as string)
                                    }
                                />
                                <XInputField
                                    id="city"
                                    name="city"
                                    label="City"
                                    type="text"
                                    className="h-11"
                                    icon={<MapPin className="h-5 w-5" />}
                                    placeholder="New York"
                                    value={formik.values.city}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={
                                        formik.touched.city &&
                                        (formik.errors.city as string)
                                    }
                                />
                                <XInputField
                                    id="postalCode"
                                    name="postalCode"
                                    label="Postal Code"
                                    type="text"
                                    className="h-11"
                                    placeholder="10001"
                                    icon={<MapPin className="h-5 w-5" />}
                                    value={formik.values.postalCode}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={
                                        formik.touched.postalCode &&
                                        (formik.errors.postalCode as string)
                                    }
                                />
                                <XInputField
                                    id="state"
                                    name="state"
                                    label="State"
                                    type="text"
                                    icon={<MapPin className="h-5 w-5" />}
                                    className="h-11"
                                    placeholder="NY"
                                    value={formik.values.state}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={
                                        formik.touched.state &&
                                        (formik.errors.state as string)
                                    }
                                />
                                <XInputField
                                    id="countryCode"
                                    name="countryCode"
                                    label="Country Code"
                                    type="text"
                                    className="h-11"
                                    icon={<MapPin className="h-5 w-5" />}
                                    placeholder="US"
                                    value={formik.values.countryCode}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={
                                        formik.touched.countryCode &&
                                        (formik.errors.countryCode as string)
                                    }
                                />
                                <XInputField
                                    id="website"
                                    name="website"
                                    label="Website"
                                    type="text"
                                    icon={<Globe className="h-5 w-5" />}
                                    className="h-11"
                                    placeholder="https://example.com"
                                    value={formik.values.website}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={
                                        formik.touched.website &&
                                        (formik.errors.website as string)
                                    }
                                />
                                <XInputField
                                    id="phone"
                                    name="phone"
                                    label="Primary Phone"
                                    type="text"
                                    className="h-11"
                                    placeholder="+91 9625047836"
                                    icon={<Phone className="h-5 w-5" />}
                                    value={formik.values.phone}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={
                                        formik.touched.phone &&
                                        (formik.errors.phone as string)
                                    }
                                />

                                {/* Emails */}
                                <div className="col-span-2">
                                    <label className="text-sm font-medium">Emails</label>
                                    {emailInputs.map((email: string, index: number) => (
                                        <div key={index} title={email} className="flex gap-2 mb-2">
                                            <XInputField
                                                id={`emails[${index}]`}
                                                name={`emails[${index}]`}
                                                type="email"
                                                className="h-11 mt-1.5 flex-1"
                                                placeholder="email@example.com"
                                                icon={<Mail className="h-5 w-5" />}
                                                value={formik.values.emails[index] || ""}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                error={
                                                    ((formik.touched.emails as any)?.[index] &&
                                                        (formik.errors.emails?.[index]) as string)
                                                }
                                            />
                                            {emailInputs.length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    className="h-10 w-10 mt-2 rounded-sm flex items-center justify-center"
                                                    onClick={() => removeField("emails", index)}
                                                >
                                                    <Minus />
                                                </Button>
                                            )}
                                            {index === emailInputs.length - 1 && (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    className="h-10 w-10 mt-2 rounded-sm flex items-center justify-center"
                                                    onClick={() => addField("emails")}
                                                >
                                                    <Plus />
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Phones */}
                                <div className="col-span-2">
                                    <label className="text-sm font-medium">Additional Phones</label>
                                    {phoneInputs.map((phone: string, index: number) => (
                                        <div key={index} title={phone} className="flex gap-2 mb-2">
                                            <XInputField
                                                id={`phones[${index}]`}
                                                name={`phones[${index}]`}
                                                type="text"
                                                className="h-11 mt-1.5 flex-1"
                                                placeholder="+91 9625047836"
                                                icon={<Phone className="h-5 w-5" />}
                                                value={formik.values.phones[index] || ""}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                error={
                                                    (formik.touched.phones as any)?.[index] &&
                                                    formik.errors.phones?.[index] as string
                                                }
                                            />
                                            {phoneInputs.length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    className="h-10 w-10 mt-2 rounded-sm flex items-center justify-center"
                                                    onClick={() => removeField("phones", index)}
                                                >
                                                    <Minus />
                                                </Button>
                                            )}
                                            {index === phoneInputs.length - 1 && (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    className="h-10 w-10 mt-2 rounded-sm flex items-center justify-center"
                                                    onClick={() => addField("phones")}
                                                >
                                                    <Plus />
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Categories */}
                                <div className="col-span-2">
                                    <label className="text-sm font-medium">Categories</label>
                                    {categoryInputs.map((category: string, index: number) => (
                                        <div key={index} title={category} className="flex gap-2 mb-2">
                                            <XInputField
                                                id={`categories[${index}]`}
                                                name={`categories[${index}]`}
                                                type="text"
                                                className="h-11 mt-1.5 flex-1"
                                                icon={<Layers className="h-5 w-5" />}
                                                placeholder="Category"
                                                value={formik.values.categories[index] || ""}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                error={
                                                    (formik.touched.categories as any)?.[index] &&
                                                    (formik.errors.categories as any)?.[index]
                                                }
                                            />
                                            {categoryInputs.length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    className="h-10 w-10 mt-2 rounded-sm flex items-center justify-center"
                                                    onClick={() => removeField("categories", index)}
                                                >
                                                    <Minus />
                                                </Button>
                                            )}
                                            {index === categoryInputs.length - 1 && (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    className="h-10 w-10 mt-2 rounded-sm flex items-center justify-center"
                                                    onClick={() => addField("categories")}
                                                >
                                                    <Plus />
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </form>
                        </DialogDescription>
                    </div>
                </DialogHeader>
                <DialogFooter className="border-t px-6 py-4 sm:items-center">
                    <DialogClose asChild>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                        >
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button type="submit" disabled={formik.isSubmitting} form="lead-form">
                        Save
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog >
    );
};

export default LeadModal;