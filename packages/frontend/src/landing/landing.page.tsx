import { motion } from "motion/react";
import { Calendar, Users, MessageSquare, BookOpen, MapPin } from "lucide-react";
import { PointerHighlight } from "@/components/ui/pointer-highlight";
import { Highlight } from "@/components/ui/hero-highlight";
import LandingNav from "./landing-nav";

const features = [
  {
    title: "Smart Calendar",
    description:
      "Coordinate care schedules and manage appointments seamlessly.",
    icon: Calendar,
  },
  {
    title: "Co-Caregiving",
    description: "Connect with family members and share responsibilities.",
    icon: Users,
  },
  {
    title: "AI Assistant",
    description: "Get instant answers about medications and appointments.",
    icon: MessageSquare,
  },
  {
    title: "Voice Notes",
    description: "Record and transcribe care notes effortlessly.",
    icon: MessageSquare,
  },
  {
    title: "Care Resources",
    description: "Access training guides and emergency hotlines.",
    icon: BookOpen,
  },
  {
    title: "Location Tracking",
    description: "Find nearby healthcare facilities easily.",
    icon: MapPin,
  },
];

const LandingPage = () => {
  return (
    <>
      <LandingNav />
      <div className="min-h-screen bg-white dark:bg-neutral-950">
        {/* Hero Section */}
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-50 to-white dark:from-neutral-900 dark:to-neutral-950" />
          <div className="container relative mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <h1 className="text-5xl font-light tracking-tight text-gray-900 dark:text-white sm:text-7xl whitespace-nowrap flex flex-col md:flex-row items-center gap-2">
                  <span className="flex flex-row gap-2">
                    Care{" "}
                    <PointerHighlight>
                      <span>Smarter</span>
                    </PointerHighlight>
                    ,
                  </span>
                  <span className="font-medium">Not Harder</span>
                </h1>
                <p className="mt-8 text-lg leading-8 text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                  The all-in-one platform for caregivers. Coordinate care,
                  manage appointments, and access resources - all in one place.
                </p>
                <div className="mt-12 flex items-center justify-center gap-x-6">
                  <motion.a
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    href="/login"
                    className="btn-primary"
                  >
                    Use Carely for free
                  </motion.a>
                  <a
                    href="#features"
                    className="text-sm font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    Learn more <span aria-hidden="true">→</span>
                  </a>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-32">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center mb-20">
              <h2 className="text-3xl font-light tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                Everything you need to{" "}
                <Highlight className="text-white">care better</Highlight>
              </h2>
              <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
                Powerful features designed to make caregiving more efficient and
                effective.
              </p>
            </div>
            <div className="mx-auto max-w-7xl">
              <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3">
                {features.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="group relative"
                  >
                    <div className="absolute -inset-4 rounded-2xl bg-gray-50 dark:bg-neutral-900 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative">
                      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600/10 text-blue-600 dark:bg-blue-400/10 dark:text-blue-400">
                        <feature.icon className="h-6 w-6" />
                      </div>
                      <h3 className="text-xl font-medium text-gray-900 dark:text-white">
                        {feature.title}
                      </h3>
                      <p className="mt-4 text-gray-600 dark:text-gray-300">
                        {feature.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative py-32">
          <div className="absolute inset-0 bg-gradient-to-b from-white to-blue-50 dark:from-neutral-950 dark:to-neutral-900" />
          <div className="container relative mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-light tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                Ready to transform your{" "}
                <span className="font-medium">caregiving experience?</span>
              </h2>
              <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
                Join thousands of caregivers who are already using Carely to
                provide better care.
              </p>
              <div className="mt-12 flex items-center justify-center gap-x-6">
                <motion.a
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  href="/login"
                  className="btn-primary"
                >
                  Use Carely for free
                </motion.a>
                <a
                  href="#"
                  className="text-sm font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Learn more <span aria-hidden="true">→</span>
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default LandingPage;
