workflow "New workflow" {
  on = "push"
  resolves = ["NPM Runner"]
}

action "Master Branch Filter" {
  uses = "actions/bin/filter@db72a46c8ce298e5d2c3a51861e20c455581524f"
  args = "branch master"
}

action "NPM Runner" {
  uses = "actions/npm@de7a3705a9510ee12702e124482fad6af249991b"
  needs = ["Master Branch Filter"]
  runs = "./.github/docs-entrypoint.sh"
}
