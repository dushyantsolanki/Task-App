import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { AnimatedShinyText } from "@/components/magicui/animated-shiny-text"
import { useState, useEffect } from "react"
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSeparator,
    InputOTPSlot,
} from "@/components/ui/input-otp"
import { useNavigate } from "react-router-dom"
import { useLocalStorage } from "@reactuses/core"
import { toast } from "sonner"
import axios from "axios"

interface OtpVerifyFormProps extends React.ComponentPropsWithoutRef<"form"> {
    otpLength?: number

    onResendOtp?: () => void
    email?: string
}

export default function OtpVerifyForm({
    className,
    otpLength = 6,
    onResendOtp,
    ...props
}: OtpVerifyFormProps) {
    const [value, setValue] = useLocalStorage("email", '')
    const email = value
    const naivigate = useNavigate()
    const [otp, setOtp] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [countdown, setCountdown] = useState(120) // 2 minutes
    const [canResend, setCanResend] = useState(false)

    const handleOTPVerification = async (values: string) => {
        setIsLoading(true)
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL || 'https://task-mate-full-stack.onrender.com/api/v1'}/auth/verify-otp`, { otp: values, email })
            const data = await response.data
            if (response.status === 201) {
                toast.success(data.message)
                setValue('')
                setTimeout(() => {
                    naivigate('/login')
                }, 2000)
            }
        } catch (error: any) {
            console.log("Error verifying OTP:", error)
            toast.error(error.response.data.message || "Internal server error")
        } finally {
            setIsLoading(false)
        }

    }

    // Countdown timer for resend OTP
    useEffect(() => {
        let interval: NodeJS.Timeout
        if (countdown > 0 && !canResend) {
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
    }, [countdown, canResend])

    const handleOtpChange = (value: string) => {
        setOtp(value)

        // Auto-submit when OTP is complete
        if (value.length === otpLength) {
            handleOTPVerification(value)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (otp.length === otpLength) {

            try {
                console.log('otp ::: ', otp)
                handleOTPVerification(otp)

            } catch (error) {
                console.error("OTP verification failed:", error)
            }
        }
    }

    const handleResendOtp = async () => {
        if (canResend) {
            setIsLoading(true)
            try {
                const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL || 'https://task-mate-full-stack.onrender.com/api/v1'}/auth/resend-otp`, { email, purpose: 'verify_account' })
                const data = await response.data
                if (response.status === 201) {
                    toast.success(data.message)
                    setCountdown(120) // Reset countdown to 2 minutes
                    setCanResend(false)
                    setOtp("")
                }

            } catch (error: any) {
                toast.error(error.response.data.message || "Internal server error")
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

    // Render OTP slots based on length
    const renderOtpSlots = () => {
        const slots = []
        const groupSize = 3

        for (let i = 0; i < otpLength; i += groupSize) {
            const group = []
            const remainingSlots = Math.min(groupSize, otpLength - i)

            for (let j = 0; j < remainingSlots; j++) {
                group.push(
                    <InputOTPSlot key={i + j} index={i + j} />
                )
            }

            slots.push(
                <InputOTPGroup key={i}>
                    {group}
                </InputOTPGroup>
            )

            // Add separator between groups (but not after the last group)
            if (i + groupSize < otpLength) {
                slots.push(<InputOTPSeparator key={`sep-${i}`} />)
            }
        }

        return slots
    }

    return (
        <form onSubmit={handleSubmit} className={cn("flex flex-col gap-6", className)} {...props}>
            <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">
                    <AnimatedShinyText className="inline-flex items-center justify-center transition ease-out hover:text-neutral-600 hover:duration-300 hover:dark:text-neutral-400">
                        Verify Your Account
                    </AnimatedShinyText>
                </h1>
                <p className="text-balance text-sm text-muted-foreground">
                    We've sent a {otpLength}-digit verification code to{" "}
                    <span className="font-medium text-foreground">
                        {email}
                    </span>
                </p>
            </div>

            <div className="grid gap-6">
                {/* OTP Input */}
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
                    {otp.length > 0 && otp.length < otpLength && (
                        <p className="text-xs text-muted-foreground text-center">
                            Please enter all {otpLength} digits
                        </p>
                    )}
                </div>

                {/* Submit Button */}
                <Button
                    type="submit"
                    disabled={otp.length !== otpLength || isLoading}
                    className="w-2/3 mx-auto"
                >
                    {isLoading ? "Verifying..." : "Verify OTP"}
                </Button>

                {/* Resend OTP Section */}
                {email && (<div className="text-center text-sm">
                    <p className="text-muted-foreground">
                        Didn't receive the code?{" "}
                        {canResend ? (
                            <button
                                type="button"
                                onClick={handleResendOtp}
                                disabled={isLoading}
                                className="font-medium text-primary hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Resend OTP
                            </button>
                        ) : (
                            <span className="font-medium">
                                Resend in {formatCountdown(countdown)}
                            </span>
                        )}
                    </p>
                </div>)}

                {/* Back/Change Contact Info */}
                <div className="text-center">
                    <button
                        type="button"
                        className="text-sm text-muted-foreground hover:text-foreground underline"
                        onClick={() => naivigate('/register')}
                    >
                        Change email address
                    </button>
                </div>
            </div>
        </form>
    )
}