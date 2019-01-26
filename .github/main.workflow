workflow "New workflow" {
  on = "push"
  resolves = ["GitHub Action for npm-1"]
}

action "GitHub Action for npm" {
  uses = "actions/bin/filter@db72a46c8ce298e5d2c3a51861e20c455581524f"
  args = "branch master"
}

action "GitHub Action for npm-1" {
  uses = "actions/npm@de7a3705a9510ee12702e124482fad6af249991b"
  needs = ["GitHub Action for npm"]
  runs = "cd docs/_build && npm install && npm start"
}
