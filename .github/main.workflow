workflow "New workflow" {
  on = "push"
  resolves = ["Build and deploy docs"]
}

action "Master Branch Filter" {
  uses = "actions/bin/filter@db72a46c8ce298e5d2c3a51861e20c455581524f"
  args = "branch master"
}

action "Build and deploy docs" {
  uses = "./docs/"
  needs = ["Master Branch Filter"]
  secrets = ["GITHUB_TOKEN"]
}
