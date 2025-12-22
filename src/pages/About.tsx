import * as React from "react";
import { HomeLayout } from "@/components/layout/HomeLayout";

export default function About() {
  return (
    <HomeLayout showWelcomeBanner={false}>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">About Writewise</h1>
        
        <div className="prose prose-sm sm:prose lg:prose-lg dark:prose-invert max-w-none">
          <p className="lead">
            Writewise is an AI-powered academic writing assistant designed to help students, 
            researchers, and academics produce high-quality written work with less effort and more confidence.
          </p>
          
          <h2>Our Mission</h2>
          <p>
            Our mission is to democratize access to advanced writing tools and make the academic 
            writing process more efficient, effective, and enjoyable for everyone.
          </p>
          
          <h2>Our Story</h2>
          <p>
            Writewise was founded in 2023 by a team of academics, AI researchers, and software 
            engineers who experienced firsthand the challenges of academic writing. 
            We understand the unique demands of academic writing—from navigating complex citation 
            styles to maintaining consistent argumentation across long documents.
          </p>
          
          <h2>How We're Different</h2>
          <p>
            Unlike general-purpose writing tools, Writewise is specifically built for academic 
            writing. Our AI models are trained on scholarly articles, research papers, and 
            academic publications to ensure they understand the conventions and expectations 
            of academic writing.
          </p>
          
          <h2>Our Values</h2>
          <ul>
            <li><strong>Integrity:</strong> We help users improve their writing, not replace their original thinking.</li>
            <li><strong>Accessibility:</strong> We make advanced writing tools accessible to academics at all levels.</li>
            <li><strong>Privacy:</strong> We prioritize the security and privacy of our users' intellectual property.</li>
            <li><strong>Innovation:</strong> We continuously improve our AI models to provide the best possible assistance.</li>
          </ul>
          
          <h2>Meet the Team</h2>
          <p>
            Our team combines expertise in natural language processing, academic writing, 
            and software development to create tools that truly understand and improve academic writing.
          </p>
        </div>
      </div>
    </HomeLayout>
  );
}
