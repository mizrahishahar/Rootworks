---
Type: Campaign ICP
client: Dave.io
segment: Owner-Led - Hiring
---

# Owner-Led - Hiring - ICP

**Segment:** owner-led, no dedicated infra owner. Founder / CTO at small, early-stage US companies on the cloud, whose company is currently hiring an infrastructure or DevOps engineer.

## Audience - Classic Search prompt

Build an audience of the technical decision-maker at early-stage, cloud-based US software companies.

Who to reach (the person):
- CTOs, co-founders who serve as CTO, technical co-founders, and founders
- seniority: C-level, founder, or owner
- in the engineering function
- this is the person who owns engineering and infrastructure decisions

At companies that are:
- 10 to 200 employees
- early stage (pre-seed through Series A)
- running on AWS, GCP, or Azure
- headquartered in the United States (Canada is acceptable)

Do not return individual engineers, DevOps hires, or non-technical roles. Return the founder or top engineering leader, one per company.

## Structured backup (filters)


Company:
  headcount:    11-200
  funding:      Seed, Series A
  technologies: AWS OR GCP OR Azure
  hq_location:  United States (+ Canada)
Contact:
  job_titles (similar): CTO, Co-Founder & CTO, Technical Co-Founder, Founder
  seniority:    CXO, Founder
  department:   Engineering

(No industry filter, cloud + persona + the hiring gate qualify the company.)

## Intent gate - AI Condition (step 1 of the flow)

Is {{company}} currently hiring an infrastructure-focused engineering role (DevOps, SRE,
Platform, Infrastructure, or Cloud Engineer) posted in roughly the last 60 days? Answer NO
if uncertain.

YES continues the sequence, NO ends. Non-qualifiers cost nothing (gate is before any LinkedIn action) and stay available for a separate broad, non-signal campaign later.
