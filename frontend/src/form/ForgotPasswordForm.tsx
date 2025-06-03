import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { XInputField } from "@/components/custom/XInputField"
import { Mail, ArrowLeft, Eye, EyeOff, CheckCircle } from "lucide-react"
import { AnimatedShinyText } from "@/components/magicui/animated-shiny-text"
import { Link } from "react-router-dom"
import { useFormik, FormikProvider, Form } from "formik";
import * as Yup from "yup";
import { useState, useEffect } from "react"
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSeparator,
    InputOTPSlot,
} from "@/components/ui/input-otp"
import { toast } from "sonner"
import axios from "axios"

// Validation Schemas
const EmailSchema = Yup.object().shape({
    email: Yup.string()
        .email("Invalid email address")
        .required("Email is required"),
});

const ResetPasswordSchema = Yup.object().shape({
    password: Yup.string()
        .min(8, "Password must be at least 8 characters")
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain uppercase, lowercase, and number")
        .required("Password is required"),
    confirmPassword: Yup.string()
        .oneOf([Yup.ref('password')], 'Passwords must match')
        .required("Please confirm your password"),
});

type Step = 'email' | 'otp' | 'reset' | 'success'


export default function ForgotPasswordFlow({
    className,
    ...props
}: React.ComponentPropsWithoutRef<"div">) {
    const otpLength = 6
    const [currentStep, setCurrentStep] = useState<Step>('email')
    const [isLoading, setIsLoading] = useState(false)
    const [email, setEmail] = useState("")
    const [otp, setOtp] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [countdown, setCountdown] = useState(120)
    const [canResend, setCanResend] = useState(false)

    // Email form
    const emailFormik = useFormik({
        initialValues: { email: "" },
        validationSchema: EmailSchema,
        onSubmit: async (values) => {
            setIsLoading(true)
            try {
                const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL || 'https://task-mate-full-stack.onrender.com/api/v1'}/auth/forgot-password`, values)

                if (response.status === 201) {
                    toast.success('OTP send successfully.')
                    setEmail(values.email)
                    setCurrentStep('otp')
                    setCountdown(120)
                    setCanResend(false)

                }

            } catch (error: any) {
                toast.error(error.response.data.message)
                console.error("Failed to send OTP:", error)
            } finally {
                setIsLoading(false)
            }
        },
    });

    // Password reset form
    const passwordFormik = useFormik({
        initialValues: { password: "", confirmPassword: "" },
        validationSchema: ResetPasswordSchema,
        onSubmit: async (values) => {
            setIsLoading(true)
            try {
                const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL || 'https://task-mate-full-stack.onrender.com/api/v1'}/auth/forgot-password/reset-password`, { email, otp, newPassword: values.confirmPassword })

                if (response.status === 201) {
                    toast.success('OTP verified successfully.')
                    setCurrentStep('reset')

                }

                setCurrentStep('success')
            } catch (error) {
                console.error("Failed to reset password:", error)
            } finally {
                setIsLoading(false)
            }
        },
    });

    // Countdown timer for resend OTP
    useEffect(() => {
        let interval: NodeJS.Timeout
        if (countdown > 0 && !canResend && currentStep === 'otp') {
            interval = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        setCanResend(true)
                        return 0
                    }
                    return prev - 1
                })
            }, 1000)
        }
        return () => clearInterval(interval)
    }, [countdown, canResend, currentStep])

    const handleOtpChange = async (value: string) => {
        setOtp(value)

        if (value.length === otpLength) {
            setIsLoading(true)
            try {
                const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL || 'https://task-mate-full-stack.onrender.com/api/v1'}/auth/forgot-password/verify-otp`, { email, otp: value })

                if (response.status === 200) {
                    toast.success('OTP verified successfully.')
                    setCurrentStep('reset')

                }

            } catch (error) {
                console.error("OTP verification failed:", error)
                setOtp("") // Clear OTP on error
            } finally {
                setIsLoading(false)
            }
        }
    }

    const handleResendOtp = async () => {
        if (canResend) {
            setIsLoading(true)
            try {
                const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL || 'https://task-mate-full-stack.onrender.com/api/v1'}/auth/forgot-password`, { email })

                if (response.status === 201) {
                    toast.success('OTP send successfully.')
                    setCountdown(120)
                    setCanResend(false)
                    setOtp("")
                }


            } catch (error) {
                console.error("Resend OTP failed:", error)
            } finally {
                setIsLoading(false)
            }
        }
    }

    const formatCountdown = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    const renderOtpSlots = () => {
        const slots = []
        const groupSize = 3

        for (let i = 0; i < otpLength; i += groupSize) {
            const group = []
            const remainingSlots = Math.min(groupSize, otpLength - i)

            for (let j = 0; j < remainingSlots; j++) {
                group.push(<InputOTPSlot key={i + j} index={i + j} />)
            }

            slots.push(
                <InputOTPGroup key={i}>
                    {group}
                </InputOTPGroup>
            )

            if (i + groupSize < otpLength) {
                slots.push(<InputOTPSeparator key={`sep-${i}`} />)
            }
        }

        return slots
    }

    const getStepIndicator = () => (
        <div className=" flex items-center justify-between mb-6">
            {(['email', 'otp', 'reset'] as const).map((step, index) => (
                <div key={step} className="flex items-center">
                    <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center text-xs font-medium",
                        currentStep === step
                            ? "bg-primary text-primary-foreground"
                            : (['email', 'otp', 'reset'] as const).indexOf(currentStep as any) > index
                                ? "bg-green-500 text-white"
                                : "bg-muted text-muted-foreground"
                    )}>
                        {(['email', 'otp', 'reset'] as const).indexOf(currentStep as any) > index ? (
                            <CheckCircle className="w-5 h-5" />
                        ) : (
                            index + 1
                        )}
                    </div>
                    {
                        index < 2 && (
                            <div className={cn(
                                "w-24 md:w-40  h-0.5 mx-2",
                                (['email', 'otp', 'reset'] as const).indexOf(currentStep as any) > index
                                    ? "bg-green-500"
                                    : "bg-muted"
                            )} />
                        )
                    }
                </div>
            ))
            }
        </div >
    )

    // Step 1: Email Input
    if (currentStep === 'email') {
        return (
            <div className={cn("flex flex-col gap-6", className)} {...props}>
                {getStepIndicator()}

                <FormikProvider value={emailFormik}>
                    <Form className="flex flex-col gap-6">
                        <div className="flex flex-col items-center gap-2 text-center">
                            <h1 className="text-2xl font-bold">
                                <AnimatedShinyText className="inline-flex items-center justify-center transition ease-out hover:text-neutral-600 hover:duration-300 hover:dark:text-neutral-400">
                                    Forgot Password?
                                </AnimatedShinyText>
                            </h1>
                            <p className="text-balance text-sm text-muted-foreground max-w-md">
                                Enter your email address and we'll send you a verification code to reset your password.
                            </p>
                        </div>

                        <div className="grid gap-6">
                            <XInputField
                                id="email"
                                name="email"
                                label="Email"
                                type="email"
                                className="h-11"
                                placeholder="m@example.com"
                                icon={<Mail size={20} />}
                                value={emailFormik.values.email}
                                onChange={emailFormik.handleChange}
                                onBlur={emailFormik.handleBlur}
                                error={emailFormik.touched.email && emailFormik.errors.email}
                                disabled={isLoading}
                            />

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isLoading || !emailFormik.isValid}
                            >
                                {isLoading ? "Sending Code..." : "Send Verification Code"}
                            </Button>
                        </div>
                    </Form>
                </FormikProvider>

                <div className="text-center text-sm">
                    <Link to='/login' className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Login
                    </Link>
                </div>
            </div>
        )
    }

    // Step 2: OTP Verification
    if (currentStep === 'otp') {
        return (
            <div className={cn("flex flex-col gap-6", className)} {...props}>
                {getStepIndicator()}

                <div className="flex flex-col items-center gap-2 text-center">
                    <h1 className="text-2xl font-bold">
                        <AnimatedShinyText className="inline-flex items-center justify-center transition ease-out hover:text-neutral-600 hover:duration-300 hover:dark:text-neutral-400">
                            Verify Your Email
                        </AnimatedShinyText>
                    </h1>
                    <p className="text-balance text-sm text-muted-foreground">
                        We've sent a {otpLength}-digit verification code to{" "}
                        <span className="font-medium text-foreground">{email}</span>
                    </p>
                </div>

                <div className="grid gap-6">
                    <div className="flex flex-col gap-4">
                        <label className="text-sm font-medium text-center">
                            Enter verification code
                        </label>
                        <div className="flex justify-center">
                            <InputOTP
                                maxLength={otpLength}
                                value={otp}
                                onChange={handleOtpChange}
                                disabled={isLoading}
                            >
                                {renderOtpSlots()}
                            </InputOTP>
                        </div>
                        {isLoading && (
                            <p className="text-xs text-center text-muted-foreground">
                                Verifying code...
                            </p>
                        )}
                    </div>

                    <div className="text-center text-sm">
                        <p className="text-muted-foreground">
                            Didn't receive the code?{" "}
                            {canResend ? (
                                <button
                                    type="button"
                                    onClick={handleResendOtp}
                                    disabled={isLoading}
                                    className="font-medium text-primary hover:underline disabled:opacity-50"
                                >
                                    Resend Code
                                </button>
                            ) : (
                                <span className="font-medium">
                                    Resend in {formatCountdown(countdown)}
                                </span>
                            )}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => setCurrentStep('email')}
                        className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center justify-center"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Change email address
                    </button>
                </div>
            </div>
        )
    }

    // Step 3: Reset Password
    if (currentStep === 'reset') {
        return (
            <div className={cn("flex flex-col gap-6", className)} {...props}>
                {getStepIndicator()}

                <FormikProvider value={passwordFormik}>
                    <Form className="flex flex-col gap-6">
                        <div className="flex flex-col items-center gap-2 text-center">
                            <h1 className="text-2xl font-bold">
                                <AnimatedShinyText className="inline-flex items-center justify-center transition ease-out hover:text-neutral-600 hover:duration-300 hover:dark:text-neutral-400">
                                    Create New Password
                                </AnimatedShinyText>
                            </h1>
                            <p className="text-balance text-sm text-muted-foreground">
                                Your identity has been verified. Set your new password below.
                            </p>
                        </div>

                        <div className="grid gap-6">
                            <XInputField
                                id="password"
                                name="password"
                                label="New Password"
                                type={showPassword ? "text" : "password"}
                                className="h-11"
                                placeholder="Enter new password"
                                icon={
                                    <div className="flex items-center justify-center">
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="text-muted-foreground hover:text-foreground"
                                        >
                                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                }
                                value={passwordFormik.values.password}
                                onChange={passwordFormik.handleChange}
                                onBlur={passwordFormik.handleBlur}
                                error={passwordFormik.touched.password && passwordFormik.errors.password}
                                disabled={isLoading}
                            />

                            <XInputField
                                id="confirmPassword"
                                name="confirmPassword"
                                label="Confirm New Password"
                                type={showConfirmPassword ? "text" : "password"}
                                className="h-11"
                                placeholder="Confirm new password"
                                icon={
                                    <div className="flex items-center justify-center">
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="text-muted-foreground hover:text-foreground"
                                        >
                                            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                }
                                value={passwordFormik.values.confirmPassword}
                                onChange={passwordFormik.handleChange}
                                onBlur={passwordFormik.handleBlur}
                                error={passwordFormik.touched.confirmPassword && passwordFormik.errors.confirmPassword}
                                disabled={isLoading}
                            />

                            <div className="text-xs text-muted-foreground space-y-1">
                                <p>Password must contain:</p>
                                <ul className="list-disc list-inside space-y-1 ml-2">
                                    <li>At least 8 characters</li>
                                    <li>One uppercase letter</li>
                                    <li>One lowercase letter</li>
                                    <li>One number</li>
                                </ul>
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isLoading || !passwordFormik.isValid}
                            >
                                {isLoading ? "Updating Password..." : "Update Password"}
                            </Button>
                        </div>
                    </Form>
                </FormikProvider>
            </div>
        )
    }

    // Step 4: Success
    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <div className="flex flex-col items-center gap-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                    <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>

                <div className="space-y-2">
                    <h1 className="text-2xl font-bold">
                        <AnimatedShinyText className="inline-flex items-center justify-center transition ease-out hover:text-neutral-600 hover:duration-300 hover:dark:text-neutral-400">
                            Password Updated Successfully
                        </AnimatedShinyText>
                    </h1>
                    <p className="text-balance text-sm text-muted-foreground max-w-md">
                        Your password has been updated successfully. You can now login with your new password.
                    </p>
                </div>
            </div>

            <div className="grid gap-4">
                <Link to="/login">
                    <Button className="w-full">
                        Continue to Login
                    </Button>
                </Link>
            </div>
        </div>
    )
}