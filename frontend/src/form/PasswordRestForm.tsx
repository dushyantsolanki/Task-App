import { Button } from "@/components/ui/button"
import { useFormik, FormikProvider, Form } from "formik"
import * as Yup from "yup"
import { toast } from "sonner"
import { useState } from "react"
import { useAuthStore } from "@/store/authStore"
import { Lock, SendIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { XInputField } from "@/components/custom/XInputField"
import AxiousInstance from "@/helper/AxiousInstance"
import { cn } from "@/lib/utils"

const PasswordSchema = Yup.object().shape({
    newPassword: Yup.string()
        .required("New password is required")
        .min(8, "Password must be at least 8 characters")
        .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
        .matches(/[a-z]/, "Password must contain at least one lowercase letter")
        .matches(/[0-9]/, "Password must contain at least one number")
        .matches(/[!@#$%^&*]/, "Password must contain at least one special character"),
    confirmPassword: Yup.string()
        .required("Confirm password is required")
        .oneOf([Yup.ref("newPassword")], "Passwords must match"),
})

export default function PasswordResetForm({
    className,
    ...props
}: React.ComponentPropsWithoutRef<"form">) {
    const { user } = useAuthStore()
    const [isPasswordReset, setIsPasswordReset] = useState(false)
    const [isOTPSent, setIsOTPSent] = useState(false)
    const [isOTPVerified, setIsOTPVerified] = useState(false)
    const [otp, setOtp] = useState("")
    const [otpError, setOtpError] = useState<string | null>(null)
    const [loading, setLoading] = useState<boolean>(false)

    const handleSendPasswordOTP = async () => {
        try {
            setLoading(true)
            const response = await AxiousInstance.post(
                `/auth/profile/send-otp?type=forgot_password`,
                { email: user?.email, surname: user?.name?.split(' ')[1] || "" }
            )
            if (response.status === 201) {
                toast.success("OTP sent to your email")
                setIsOTPSent(true)
                setOtpError(null)
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to send OTP")
            console.error("Error sending OTP:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleVerifyPasswordOTP = async () => {
        try {
            setLoading(true)
            const response = await AxiousInstance.post(
                `/auth/profile/verify-otp`,
                { email: user?.email, otp },

            )
            if (response.status === 200) {
                toast.success("OTP verified successfully")
                setIsOTPVerified(true)
                setOtpError(null)
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "Invalid OTP"
            setOtpError(errorMessage)
            toast.error(errorMessage)
            console.error("Error verifying OTP:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleUpdatePassword = async (values: { newPassword: string; confirmPassword: string }) => {
        if (!isOTPVerified) {
            toast.error("Please verify OTP before updating the password")
            return
        }
        setLoading(true)

        try {
            const response = await AxiousInstance.patch(
                `/auth/profile/reset-password/${user?.id}`,
                { password: values.newPassword }
            )
            if (response.status === 200) {
                toast.success("Password updated successfully")
                setIsPasswordReset(false)
                setIsOTPSent(false)
                setIsOTPVerified(false)
                setOtp("")
                formik.resetForm()
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Password update failed")
            console.error("Error updating password:", error)
        }
        finally {
            setLoading(false)
        }
    }

    const formik = useFormik({
        initialValues: {
            newPassword: "",
            confirmPassword: "",
        },
        validationSchema: PasswordSchema,
        onSubmit: handleUpdatePassword,
    })

    return (
        <div className="flex items-center justify-center bg-background">
            <Card className="w-full max-w-md border-none shadow-none bg-transparent">
                <CardContent className="px-0">
                    <FormikProvider value={formik}>
                        <Form className={cn("flex flex-col gap-6", className)} {...props}>
                            {!isPasswordReset ? (
                                <Button
                                    type="button"
                                    className="w-full h-10 bg-primary hover:bg-primary/90 hover:cursor-pointer text-primary-foreground font-semibold rounded-lg transition-colors"
                                    onClick={() => setIsPasswordReset(true)}
                                    disabled={!(user.authProvider === 'local')}
                                >
                                    Create New Password
                                </Button>
                            ) : (
                                <>
                                    {!isOTPVerified && (
                                        <>
                                            <Button
                                                type="button"
                                                className="h-8 cursor-pointer font-semibold rounded-sm transition-colors"
                                                onClick={handleSendPasswordOTP}
                                                disabled={isOTPSent || loading}
                                            >
                                                <SendIcon className="mr-2 h-4 w-4" />
                                                {isOTPSent ? "OTP Sent" : "Send OTP"}
                                            </Button>
                                            {isOTPSent && (
                                                <div className="space-y-2">
                                                    <XInputField
                                                        id="otp"
                                                        name="otp"
                                                        label="Enter OTP"
                                                        type="text"
                                                        className="h-11"
                                                        placeholder="Enter OTP"
                                                        value={otp}
                                                        onChange={(e) => setOtp(e.target.value)}
                                                        error={otpError}
                                                    />
                                                    <Button
                                                        type="button"
                                                        className="h-8 w-full hover:cursor-pointer font-semibold rounded-sm transition-colors"
                                                        onClick={handleVerifyPasswordOTP}
                                                        disabled={!otp || loading}
                                                    >
                                                        Verify OTP
                                                    </Button>
                                                </div>
                                            )}
                                        </>
                                    )}
                                    {isOTPVerified && (
                                        <div className="space-y-4">
                                            <XInputField
                                                id="newPassword"
                                                name="newPassword"
                                                label="New Password"
                                                type="password"
                                                className="h-11"
                                                placeholder="Enter new password"
                                                icon={<Lock size={20} />}
                                                value={formik.values.newPassword}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                error={formik.touched.newPassword && formik.errors.newPassword}
                                            />
                                            <XInputField
                                                id="confirmPassword"
                                                name="confirmPassword"
                                                label="Confirm Password"
                                                type="password"
                                                className="h-11"
                                                placeholder="Confirm new password"
                                                icon={<Lock size={20} />}
                                                value={formik.values.confirmPassword}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                error={formik.touched.confirmPassword && formik.errors.confirmPassword}
                                            />
                                            <Button
                                                type="submit"
                                                className="w-full h-10 bg-primary hover:bg-primary/90 hover:cursor-pointer text-primary-foreground font-semibold rounded-lg transition-colors"
                                                disabled={formik.isSubmitting}
                                            >
                                                {formik.isSubmitting ? (
                                                    <>
                                                        <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"></span>
                                                        Saving...
                                                    </>
                                                ) : (
                                                    "Save Password"
                                                )}
                                            </Button>
                                        </div>
                                    )}
                                </>
                            )}
                        </Form>
                    </FormikProvider>
                </CardContent>
            </Card>
        </div>
    )
}