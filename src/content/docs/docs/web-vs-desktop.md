---
title: Web vs desktop
description: An honest comparison of running MetaProc in the browser versus the planned bundled desktop build.
---

MetaProc is the same application either way — the analysis engine, templates, and code
capture are identical. What differs is **where it runs** and **what that means for
installation, data, and offline use**.

> **Today:** the **web app** is available now. The **desktop build** is planned but not yet
> shipped (see [Download](/download)).

## At a glance

| Aspect | Web app | Desktop build *(planned)* |
|---|---|---|
| Install | Nothing — open a URL | One-time installer (bundles R + all packages) |
| Always up to date | Yes, automatically | You update when you choose |
| Works offline | No (needs the hosted service) | Yes — fully self-contained |
| Where your data goes | Uploaded to an ephemeral, EU-hosted container, destroyed at session end | Stays entirely on your machine |
| PDF reports (LaTeX) | Rendered server-side | Via a one-time TinyTeX install; falls back to HTML |
| Best for | Quick use, shared machines, no admin rights | Sensitive environments, offline work, full local control |

## When to use the web app

- You want to start **right now** with nothing to install.
- You're on a shared or locked-down machine without admin rights.
- You're working with **already-published, aggregate study-level data** (which is what a
  meta-analysis uses) and are comfortable with [the ephemeral, EU-hosted model](/privacy).

## When you'll want the desktop build

- You need to work **fully offline**, or your data-handling rules mean nothing should
  leave your machine.
- You want to **pin a version** and control exactly when it updates.
- You want everything — R, `metafor`, `netmeta`, and the rest — **bundled** so there's no
  separate R installation to manage.

## What's identical

The statistics are the same on both: the same engines, the same templates, the same
[golden-tested](/methods) results, and the same **code capture** — every result ships with
the exact R that produced it, and the reproducibility bundle re-runs in a clean R session
regardless of which version you used.

> **Note on data:** MetaProc is for **aggregate, study-level** meta-analysis. On either
> platform, do not load individual patient data or directly identifiable information.
