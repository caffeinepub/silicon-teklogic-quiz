import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/Header';
import { useActor } from '@/hooks/useActor';
import type { Participant } from '../backend';

interface RegistrationForm {
  name: string;
  registrationNumber: string;
  email: string;
  college: string;
}

export function RegisterPage() {
  const { actor, isFetching } = useActor();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors }, setError } = useForm<RegistrationForm>();

  const onSubmit = async (data: RegistrationForm) => {
    if (!actor) {
      toast.error('Backend not available');
      return;
    }

    setIsSubmitting(true);

    try {
      // Check if email is whitelisted
      const isWhitelisted = await actor.isEmailWhitelisted(data.email);
      
      if (!isWhitelisted) {
        setError('email', {
          type: 'manual',
          message: 'Your email is not approved for this quiz. Contact admin.'
        });
        toast.error('Email not whitelisted');
        setIsSubmitting(false);
        return;
      }

      // Register participant
      const participant: Participant = {
        name: data.name,
        registrationNumber: data.registrationNumber,
        email: data.email,
        college: data.college,
        registeredAt: BigInt(Date.now())
      };

      await actor.registerParticipant(participant);
      toast.success('Registration successful! Redirecting to quiz...');
      
      // Redirect to quiz with registration number
      setTimeout(() => {
        navigate({ to: '/quiz', search: { regNo: data.registrationNumber } });
      }, 1000);

    } catch (error: any) {
      console.error('Registration error:', error);
      
      if (error?.message?.includes('already exists') || error?.message?.includes('duplicate')) {
        setError('registrationNumber', {
          type: 'manual',
          message: 'This registration number is already taken'
        });
        toast.error('Registration number already exists');
      } else {
        toast.error('Registration failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-md">
          <Card>
            <CardHeader>
              <CardTitle>Participant Registration</CardTitle>
              <CardDescription>
                Register to participate in the Silicon Teklogic Conclave Quiz
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter your full name"
                    {...register('name', { required: 'Name is required' })}
                    disabled={isSubmitting || isFetching}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="registrationNumber">Registration Number</Label>
                  <Input
                    id="registrationNumber"
                    placeholder="Enter your registration number"
                    {...register('registrationNumber', { 
                      required: 'Registration number is required' 
                    })}
                    disabled={isSubmitting || isFetching}
                  />
                  {errors.registrationNumber && (
                    <p className="text-sm text-destructive">{errors.registrationNumber.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    {...register('email', { 
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    })}
                    disabled={isSubmitting || isFetching}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="college">College</Label>
                  <Input
                    id="college"
                    placeholder="Enter your college name"
                    {...register('college', { required: 'College name is required' })}
                    disabled={isSubmitting || isFetching}
                  />
                  {errors.college && (
                    <p className="text-sm text-destructive">{errors.college.message}</p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isSubmitting || isFetching}
                >
                  {isSubmitting ? 'Registering...' : 'Register & Start Quiz'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        <p>
          © 2026. Built with ❤️ using{' '}
          <a 
            href="https://caffeine.ai" 
            target="_blank" 
            rel="noopener noreferrer"
            className="underline hover:text-foreground"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
