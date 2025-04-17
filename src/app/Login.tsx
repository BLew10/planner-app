"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import login, { LoginData } from "@/actions/user/login";
import AnimateWrapper from "@/app/(components)/general/AnimateWrapper";
import { EyeIcon, EyeOffIcon } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";

const LoginComponent: React.FC = () => {
  const router = useRouter();
  const [isHidden, setIsHidden] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requesting, setRequesting] = useState(false);

  const form = useForm<LoginData>({
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginData) => {
    setRequesting(true);
    const res = await login(data);
    setRequesting(false);
    if (res && res.error) {
      setError(res.error as string);
    } else if (res && res.success) {
      router.push('/dashboard');
    }
  };

  return (
    <AnimateWrapper>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Login</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          type={isHidden ? "password" : "text"} 
                          placeholder="Enter your password" 
                          {...field} 
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setIsHidden(!isHidden)}
                        >
                          {isHidden ? <EyeIcon className="h-4 w-4" /> : <EyeOffIcon className="h-4 w-4" />}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {error && <p className="text-sm font-medium text-destructive">{error}</p>}
              
              <Button type="submit" className="w-full" disabled={requesting}>
                {!requesting ? 'Login' : 'Logging in...'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </AnimateWrapper>
  );
};

export default LoginComponent;
