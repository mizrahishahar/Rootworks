---
Type: Campaign ICP
client: Dave.io
segment: Scaled - Hiring
---

# Scaled - Hiring - ICP

**Segment:** scaled but bottlenecked. VP Engineering / Head of Infrastructure / Director of DevOps at larger, growth-stage US companies with an existing but stretched infra team, currently hiring an infra role.

## Audience - Classic Search prompt

Build an audience of the senior engineering leader at scaled, cloud-based US software companies.

Who to reach (the person):
- VP Engineering, Head of Infrastructure, Head of Platform Engineering, Director of DevOps, Director of SRE
- seniority: VP, Director, or Head, in the engineering function
- this is the person who owns the infrastructure function and the DevOps team

At companies that are:
- 200 to 2000 employees
- growth stage (Series B and beyond)
- running on AWS, GCP, or Azure
- headquartered in the United States

Do not return individual engineers, DevOps hires, or founders of tiny startups. Return the VP of Engineering or the head of the infrastructure or platform function, one per company.

## Structured backup (filters)


Company:
  headcount:    201-2000
  funding:      Series B, Series C, Series D+
  technologies: AWS OR GCP OR Azure
  hq_location:  United States
Contact:
  job_titles (similar): VP Engineering, Head of Infrastructure, Head of Platform Engineering,
                        Director of DevOps, Director of SRE
  seniority:    VP, Director, Head
  department:   Engineering

(No industry filter, cloud + persona + the hiring gate qualify the company.)

## Intent gate - AI Condition (step 1 of the flow)

Is {{company}} currently hiring an infrastructure-focused engineering role (DevOps, SRE,
Platform, Infrastructure, or Cloud Engineer) posted in roughly the last 60 days? Answer NO
if uncertain.

YES continues the sequence, NO ends. Non-qualifiers cost nothing (gate is before any LinkedIn action) and stay available for a separate broad, non-signal campaign later.
