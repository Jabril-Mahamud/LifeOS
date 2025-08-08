"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { CheckCircle2, ArrowLeft } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { COLOR_OPTIONS, HABIT_ICONS, HabitFormData } from "@/lib/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditHabit({ params }: PageProps) {
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const router = useRouter();
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0].value);
  const [selectedIcon, setSelectedIcon] = useState(HABIT_ICONS[0]);
  const [active, setActive] = useState(true);
  const [habitId, setHabitId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<HabitFormData>({
    defaultValues: {
      name: "",
      description: "",
      icon: HABIT_ICONS[0],
      color: COLOR_OPTIONS[0].value,
      active: true,
    },
  });

  // Resolve params and extract id
  useEffect(() => {
    const resolveParams = async () => {
      const { id } = await params;
      setHabitId(id);
    };
    resolveParams();
  }, [params]);

  // Fetch habit data
  useEffect(() => {
    if (!habitId) return;

    const fetchHabitData = async () => {
      setFetchingData(true);
      try {
        const response = await fetch(`/api/habits/${habitId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch habit data");
        }
        const data = await response.json();

        // Set form values
        setValue("name", data.habit.name);
        setValue("description", data.habit.description || "");
        setValue("icon", data.habit.icon || HABIT_ICONS[0]);
        setValue("color", data.habit.color || COLOR_OPTIONS[0].value);
        setValue("active", data.habit.active);

        // Set state values
        setSelectedIcon(data.habit.icon || HABIT_ICONS[0]);
        setSelectedColor(data.habit.color || COLOR_OPTIONS[0].value);
        setActive(data.habit.active);
      } catch (error) {
        console.error("Error fetching habit data:", error);
        toast({
          title: "Error",
          description: "Failed to load habit data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setFetchingData(false);
      }
    };

    fetchHabitData();
  }, [habitId, setValue]);

  const onSubmit = async (data: HabitFormData) => {
    if (!habitId) return;

    // Update data with current selections
    data.icon = selectedIcon;
    data.color = selectedColor;
    data.active = active;

    setLoading(true);
    try {
      const response = await fetch(`/api/habits/${habitId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update habit");
      }

      toast({
        title: "Success",
        description: "Habit updated successfully!",
      });

      router.push("/habits");
    } catch (error) {
      console.error("Error updating habit:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to update habit",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData) {
    return (
      <div className="container mx-auto max-w-3xl p-4 md:p-6 lg:p-8">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="icon" onClick={() => router.back()} aria-label="Go back">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold ml-2">Loading habit data...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl p-4 md:p-6 lg:p-8">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()} aria-label="Go back">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold ml-2">Edit Habit</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            <CheckCircle2 className="h-5 w-5 mr-2" />
            Edit Habit Details
          </CardTitle>
          <CardDescription>
            Update your habit tracking information
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {/* Habit Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Habit Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Enter habit name (e.g., &apos;Drink water&apos;, &apos;Read&apos;, &apos;Exercise&apos;)"
                {...register("name", { required: "Habit name is required" })}
              />
              {errors.name && (
                <p className="text-xs text-red-500">{errors.name.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter a description or goal for this habit"
                className="min-h-[100px]"
                {...register("description")}
              />
            </div>

            {/* Icon Selection */}
            <div className="space-y-2">
              <Label>Habit Icon</Label>
              <div className="grid grid-cols-8 gap-2">
                {HABIT_ICONS.map((icon) => (
                  <Button
                    key={icon}
                    type="button"
                    variant={selectedIcon === icon ? "default" : "outline"}
                    className="h-10 w-10 p-0"
                    onClick={() => setSelectedIcon(icon)}
                  >
                    <span className="text-lg">{icon}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Color Selection */}
            <div className="space-y-2">
              <Label>Habit Color</Label>
              <div className="grid grid-cols-8 gap-2">
                {COLOR_OPTIONS.map((color) => (
                  <Button
                    key={color.value}
                    type="button"
                    variant="outline"
                    className="h-10 w-10 p-0 rounded-full border-2"
                    style={{
                      backgroundColor: color.value,
                      borderColor:
                        selectedColor === color.value ? "white" : color.value,
                      outline:
                        selectedColor === color.value
                          ? `2px solid ${color.value}`
                          : "none",
                    }}
                    onClick={() => setSelectedColor(color.value)}
                  />
                ))}
              </div>
            </div>

            {/* Active Status */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="active">Active Status</Label>
                <Switch
                  id="active"
                  checked={active}
                  onCheckedChange={setActive}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                {active
                  ? "This habit is active and will be tracked"
                  : "This habit is inactive and won&apos;t appear in daily tracking"}
              </p>
            </div>
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              type="button"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}