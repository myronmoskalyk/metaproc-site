# Recapture harness: run metaproc natively on Windows for screenshot capture.
# (Adapted verbatim from metaproc-deploy/e2e/palette-run-app.R.)
setwd("C:/Users/myron/OneDrive/Documents/Metaproc_Parent/metaproc")
try(source("renv/activate.R"), silent = TRUE)
suppressMessages(pkgload::load_all(".", quiet = TRUE))
shiny::runApp(run_app(), port = 7991, host = "127.0.0.1", launch.browser = FALSE)
