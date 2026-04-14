import { Plane, Ticket, Mountain, FileText, Hotel, Map, Building, Car, Ship, Briefcase, Users, Heart, GraduationCap, Church, UserCheck, MessageCircle, FileCheck } from "lucide-react";

export interface Service {
  title: string;
  description: string;
  icon: any;
}

export const services: Service[] = [
  { title: "Airport Transfers", description: "Comfortable and reliable airport pickup and drop-off services across Uganda.", icon: Plane },
  { title: "Air Ticketing", description: "Domestic and international flight booking assistance.", icon: Ticket },
  { title: "Tracking Reservation Processing", description: "We handle all gorilla and chimpanzee tracking permit reservations.", icon: Mountain },
  { title: "Permit Processing", description: "Efficient processing of gorilla trekking and wildlife permits.", icon: FileText },
  { title: "Accommodation Booking", description: "Handpicked lodges, camps, and hotels across all destinations.", icon: Hotel },
  { title: "Tour Package Planning", description: "Custom safari itineraries tailored to your interests and budget.", icon: Map },
  { title: "Hotel & Resort Reservations", description: "Access to the finest hotels and resorts throughout Uganda.", icon: Building },
  { title: "Car Rental Services", description: "Well-maintained 4x4 safari vehicles with experienced drivers.", icon: Car },
  { title: "Cruise Bookings", description: "Lake and river cruise experiences across Uganda's waterways.", icon: Ship },
  { title: "Corporate Travel Management", description: "End-to-end travel management for business travelers.", icon: Briefcase },
  { title: "Conference & Event Travel Coordination", description: "Group travel logistics for conferences and events.", icon: Users },
  { title: "Group Travel Arrangements", description: "Seamless coordination for group safaris and tours.", icon: Users },
  { title: "Honeymoon & Romantic Getaways", description: "Unforgettable romantic safari experiences for couples.", icon: Heart },
  { title: "Educational Tours", description: "Learning-focused safaris for students and researchers.", icon: GraduationCap },
  { title: "Pilgrimage Tours", description: "Faith-based travel to Uganda's spiritual sites.", icon: Church },
  { title: "Tour Guide Services", description: "Professional, knowledgeable guides for every adventure.", icon: UserCheck },
  { title: "Travel Consultation & Itinerary Planning", description: "Expert advice to plan your perfect Uganda safari.", icon: MessageCircle },
  { title: "Travel Documentation Support", description: "Assistance with visas, travel insurance, and required documents.", icon: FileCheck },
];
