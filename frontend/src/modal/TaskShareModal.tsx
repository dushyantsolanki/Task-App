import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
    DialogClose,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Send, Users } from "lucide-react";

interface User {
    _id: string;
    name: string;
    avatar: string
}

interface ShareValues {
    shareTo: string;
    permission: "view" | "edit";
}

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    users: User[];
    handleShare: (values: ShareValues, resetForm: () => void, onClose: () => void) => void;
}

const TaskShareModal = ({ isOpen, onClose, users, handleShare }: ShareModalProps) => {

    const formik = useFormik({
        initialValues: {
            shareTo: "",
            permission: "view",
        },
        validationSchema: Yup.object({
            shareTo: Yup.string()
                .required("User selection is required"),
            permission: Yup.string()
                .oneOf(["view", "edit"], "Invalid permission")
                .required("Permission is required"),
        }),
        enableReinitialize: true,
        onSubmit: (values) => {
            handleShare(values as ShareValues, formik.resetForm, onClose);
        },
    });

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="flex flex-col gap-0 p-0 max-h-[90vh] sm:max-h-[80vh] md:max-h-[70vh] lg:max-h-[70vh] w-full max-w-md sm:max-w-lg md:max-w-md lg:max-w-md [&>button:last-child]:top-4">
                <DialogHeader className="contents space-y-0 text-left">
                    <DialogTitle className="border-b px-6 py-4 text-base">
                        Share Task
                        <p className="font-normal text-xs text-foreground">
                            Share the task by selecting a user and permission.
                        </p>
                    </DialogTitle>

                    <div className="overflow-y-auto scrollbar-hide">
                        <DialogDescription asChild>
                            <form
                                id="share-form"
                                onSubmit={formik.handleSubmit}
                                className="px-6 py-4 flex flex-col gap-4"
                            >
                                <div className="flex flex-col">
                                    <label htmlFor="shareTo" className="text-sm font-medium mb-1.5">
                                        Select User
                                    </label>
                                    <div className="relative">
                                        <Users className="h-5 w-5 absolute left-3 top-3 text-muted-foreground" />
                                        <Select
                                            onValueChange={(value) => formik.setFieldValue("shareTo", value)}
                                            value={formik.values.shareTo}
                                        >
                                            <SelectTrigger className="pl-10 w-full py-[21px]">
                                                <SelectValue placeholder="Select a user to share with" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {users.map((user) => (
                                                    <SelectItem key={user._id} value={user._id}>
                                                        <span>  {user.name} </span>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {formik.touched.shareTo && formik.errors.shareTo && (
                                            <p className="ml-1 text-sm text-red-500 mt-1.5">{formik.errors.shareTo}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex flex-col">
                                    <label htmlFor="permission" className="text-sm font-medium mb-1.5">
                                        Permission
                                    </label>
                                    <Select

                                        onValueChange={(value) => formik.setFieldValue("permission", value)}
                                        value={formik.values.permission}
                                    >
                                        <SelectTrigger className="w-full py-[21px]">
                                            <SelectValue placeholder="Select permission" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="view">View</SelectItem>
                                            <SelectItem value="edit">Edit</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {formik.touched.permission && formik.errors.permission && (
                                        <p className="ml-1 text-sm text-red-500 mt-1.5">{formik.errors.permission}</p>
                                    )}
                                </div>
                            </form>
                        </DialogDescription>
                    </div>
                </DialogHeader>
                <DialogFooter className="border-t px-6 py-4 sm:items-center">
                    <DialogClose asChild>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button type="submit" disabled={formik.isSubmitting} form="share-form">
                        <Send /> Share
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default TaskShareModal;