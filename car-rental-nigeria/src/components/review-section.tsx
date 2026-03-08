"use client"

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export function ReviewSection() {
    return (
        <section className="py-10 md:py-12 bg-gray-50" aria-label="Customer Testimonials">
            <div className="mx-auto max-w-6xl space-y-6 px-4 md:space-y-12">
                <div className="relative z-10 mx-auto max-w-xl space-y-4 text-center md:space-y-8">
                    <h2 className="text-3xl font-medium lg:text-4xl">What Our Customers Say</h2>
                    <p className="text-sm text-gray-600">Thank you for your trust in our car rental services! We are grateful for your feedback and are committed to providing the best car rental experience. Read what our clients have to say about their experience with us.</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-rows-2">
                    <Card className="grid grid-rows-[auto_1fr] gap-6 sm:col-span-2 sm:p-4 lg:row-span-2">
                        <CardHeader>
                            <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                                    <span className="text-white text-sm font-bold">CR</span>
                                </div>
                                <span className="text-base font-semibold">Car Rental Nigeria</span>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <blockquote className="grid h-full grid-rows-[1fr_auto] gap-5">
                                <p className="text-base font-medium">Car Rental Nigeria has transformed the way I travel across the country. Their extensive collection of vehicles, from luxury cars to practical SUVs, has made every trip memorable. The flexibility to choose different vehicles for different occasions allows me to create unique travel experiences. Car Rental Nigeria is a game-changer for modern travel in Nigeria.</p>

                                <div className="grid grid-cols-[auto_1fr] items-center gap-3">
                                    <Avatar className="size-10">
                                        <AvatarImage
                                            src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face"
                                            alt="Kathryn Murphy"
                                            height="400"
                                            width="400"
                                            loading="lazy"
                                        />
                                        <AvatarFallback>KM</AvatarFallback>
                                    </Avatar>

                                    <div>
                                        <cite className="text-xs font-medium">Kathryn Murphy</cite>
                                        <span className="text-muted-foreground block text-xs">Business Executive</span>
                                    </div>
                                </div>
                            </blockquote>
                        </CardContent>
                    </Card>
                    <Card className="md:col-span-2">
                        <CardContent className="h-full pt-5">
                            <blockquote className="grid h-full grid-rows-[1fr_auto] gap-5">
                                <p className="text-base font-medium">Car Rental Nigeria is really extraordinary and very practical, no need to break your head. A real gold mine for reliable transportation.</p>

                                <div className="grid grid-cols-[auto_1fr] items-center gap-3">
                                    <Avatar className="size-10">
                                        <AvatarImage
                                            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face"
                                            alt="Darlene Robertson"
                                            height="400"
                                            width="400"
                                            loading="lazy"
                                        />
                                        <AvatarFallback>DR</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <cite className="text-xs font-medium">Darlene Robertson</cite>
                                        <span className="text-muted-foreground block text-xs">Travel Consultant</span>
                                    </div>
                                </div>
                            </blockquote>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="h-full pt-5">
                            <blockquote className="grid h-full grid-rows-[1fr_auto] gap-5">
                                <p className="text-sm">Great service and excellent vehicle quality. This is one of the best car rental services that I have experienced so far!</p>

                                <div className="grid items-center gap-3 [grid-template-columns:auto_1fr]">
                                    <Avatar className="size-10">
                                        <AvatarImage
                                            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face"
                                            alt="Guy Hawkins"
                                            height="400"
                                            width="400"
                                            loading="lazy"
                                        />
                                        <AvatarFallback>GH</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <cite className="text-xs font-medium">Guy Hawkins</cite>
                                        <span className="text-muted-foreground block text-xs">Software Engineer</span>
                                    </div>
                                </div>
                            </blockquote>
                        </CardContent>
                    </Card>
                    <Card className="card variant-mixed">
                        <CardContent className="h-full pt-5">
                            <blockquote className="grid h-full grid-rows-[1fr_auto] gap-5">
                                <p className="text-sm">Outstanding customer service and well-maintained vehicles. Highly recommended for anyone looking for reliable car rental in Nigeria.</p>

                                <div className="grid grid-cols-[auto_1fr] gap-3">
                                    <Avatar className="size-10">
                                        <AvatarImage
                                            src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face"
                                            alt="Jerome Bell"
                                            height="400"
                                            width="400"
                                            loading="lazy"
                                        />
                                        <AvatarFallback>JB</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-xs font-medium">Jerome Bell</p>
                                        <span className="text-muted-foreground block text-xs">Marketing Manager</span>
                                    </div>
                                </div>
                            </blockquote>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>
    )
}
