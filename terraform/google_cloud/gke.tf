variable "gke_username" {
  default     = ""
  description = "gke username"
}

variable "gke_password" {
  default     = ""
  description = "gke password"
}

variable "gke_num_nodes" {
  default     = 2
  description = "number of gke nodes"
}

variable "gke_node_machine_type" {
  default     = "e2-standard-4"
  description = "machine type for nodes"
}

# GKE cluster
resource "google_container_cluster" "primary" {
  name     = "${var.project_id}-gke"
  location = var.region

  # We can't create a cluster with no node pool defined, but we want to only use
  # separately managed node pools. So we create the smallest possible default
  # node pool and immediately delete it.
  remove_default_node_pool = true

  network    = google_compute_network.vpc.name
  subnetwork = google_compute_subnetwork.subnet.name

  node_pool {
    name               = "default-pool"
    initial_node_count = 1
    node_config {
      disk_type = "pd-standard"
    }
  }

  lifecycle {
    ignore_changes = [
      node_pool,
    ]
  }
}

# Separately Managed Node Pool
resource "google_container_node_pool" "primary_nodes" {
  name           = google_container_cluster.primary.name
  location       = google_container_cluster.primary.location
  node_locations = [var.zone]
  cluster        = google_container_cluster.primary.name
  node_count     = var.gke_num_nodes

  autoscaling {
    min_node_count = 1
    max_node_count = 5
  }

  lifecycle {
    ignore_changes = [
      node_count
    ]
  }

  node_config {
    oauth_scopes = [
      "https://www.googleapis.com/auth/devstorage.read_only",
      "https://www.googleapis.com/auth/logging.write",
      "https://www.googleapis.com/auth/monitoring",
    ]

    labels = {
      env = var.project_id
    }

    machine_type = var.gke_node_machine_type
    disk_type    = "pd-ssd"
    tags         = ["gke-node", "${var.project_id}-gke"]
    metadata = {
      disable-legacy-endpoints = "true"
    }
  }
}
