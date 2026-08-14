const AD='1k_wUwMBXyweWkKD2Sm_Z87qJI9eXaAp3';
const PI='1RSMWoG4_5yk5cmf2FfRrx6tL3ELoLdO_';
const DV='1JyNlqEhR6Mx08xm9IVCmHvBOFsNuYdbs';
const MV='10vWZHpe-z1M7X9ZyTmRjQQ-bqpsmsvv9';
const plan=[
[AD,'1O4e50JT0tWC0KqYkQDd44wdZ-p7zc9P_qUbaNo3ieTA','2026-07-19 - Israeli DTC Shopify 10k+ - Domains without contacts'],
[AD,'1h2oANe8V_d9LBH-7nwlpRXXZQYoC7prGdFKK3XHYb2o','2026-07-19 - Israeli DTC Shopify 10K+ - Domains without contacts'],
[DV,'1Nrbbf1dcb_5uVnhiojhSOcbIYZFKm-k3QG_ANse7U3Y','2026-07-17 - XpandMarketing Lookalikes - Domains without contacts'],
[DV,'1mx1G37Zeg4nssqrJBE17cZnQnkV3kBq7wBkBwzv84O8','2026-07-17 - B2B SaaS 11-50 US - Domains without contacts'],
[DV,'16UT6R4ZqkXQxUd6BarhwGb32KMwVc-P35Dz0xPlKgyE','2026-07-17 - Calialfa, Manifold & Conntour Lookalikes - Domains without contacts'],
[PI,'1eQMx0KsX3K1N-F1IPXeQreJFrrtFWUfds0Am0K72OSs','2026-07-15 - GC-CMAR - Precon & Estimating - Domains without contacts'],
[PI,'16RxpslP6l7YlFrR0uG3hAmB1sFOlERlCZm0vOD82q7U','2026-07-15 - GC-CMAR - Business Leaders C-Suite - Domains without contacts'],
[PI,'1h0baxGBWgfarHfG705Wtv_stJaqgND2V_0tFIdO2cCk','2026-07-15 - GC-CMAR - BizDev Opportunity Hunter - Domains without contacts'],
[PI,'1aU8dC4X80n8j46bea9A1OECEhCmKXhw3g33xupq2U40','2026-06-30 - GCs / CMAR firms US CA - Domains without contacts'],
[PI,'1xr5DLuEKp5PDSLrKn6qt8MXJ4Hc2_QI98IB8Qx2QYKA','2026-06-14 - GCs / CMAR firms 50+ employees US - Domains without contacts'],
[MV,'1JALBwWAj0jYxM-GEtH3XD1CKW4BKloIgn3OvfY5ULGI','2026-07-07 - General Moving Companies in US / CA - Domains without contacts'],
[MV,'1Nm-oilW2RphLWPgJX88awFXf35BwiYoRcM2kOHFbY98','2026-07-07 - General Moving Companies in US / CA - Domains without public emails'],
[MV,'11TeSwF4S1lM9eLxqCFZBcKJmkxlCfaCRmJ8itzTfKrc','2026-07-02 - General Moving Companies in US / CA - Domains without contacts'],
[MV,'18AScyMqodNluXX6oZ6f0-UylUZG2rJRGx8ageTaew3I','2026-07-01 - General Moving Companies in US / CA - Domains without public emails'],
[MV,'1yUnERjwp9754BxAZlfhEbv2dhy3exftc-W5IWBwKBhw','2026-05-29 - General Moving Companies in US / CA - Domains without public emails'],
[MV,'1C89ZMhHwz-uH9SsuFk_LFgY9QVl03cVweVIM5w2-XZQ','2026-06-23 - General Moving Companies in US / CA 2 - Domains without contacts'],
[MV,'1LkyjsczrBNPqtMnymFBmLeM2a0iOp0UsDMuRXbRuJSc','2026-06-23 - General Moving Companies in US / CA 2 - Domains without public emails'],
[MV,'1ZXVihBUClWJ9dgIOZREWBpNWs5CXFiIWp-VScszg2q0','2026-06-23 - General Moving Companies in US / CA - Domains without public emails'],
[MV,'1s_ay8MDTaBJqlcDrsIVaG9J7LUcBHDJEkOtImwZtNCc','2026-06-23 - General Moving Companies in US / CA - Domains without contacts'],
[MV,'1Q22NSBQsBXDu7WU2THsziteZ4rAl2shug8RxCrgPVzU','2026-06-16 - General Moving Companies in US / CA - Domains without contacts'],
[MV,'1hmZ6tW-v2jibl-CYhjJeoqLTJDVanAE1udxH_TbAZKs','2026-06-16 - General Moving Companies in US / CA - Domains without public emails'],
[MV,'1x9sbRGwpUHLDJW0st4ZcnyOloCxuh_VYGsdRp_gMM6M','2026-06-12 - General Moving Companies in US   CA - Domains without contacts'],
[MV,'1CKrTEHCO5fbRwffLFnkbW-Uo49-rkLYPPyIyWmwR7Pc','2026-05-29 - General Moving Companies in US / CA - Domains without contacts'],
[MV,'1cry0WxKwGrbYo7tT-ds5LsHiBXAcXuDj','General Moving Companies - Domains without contacts - newline list.txt'],
[MV,'1RArfBj3jiy7JhK8-0hE1VxmdIMb3c5YE','General Moving Companies - Domains without contacts - comma string.txt']
];
return plan.map(p=>({json:{target:p[0],fileId:p[1],newName:p[2]}}));