migrate((app) => {
  const sermons = app.findCollectionByNameOrId("sermons")
  const serviceType = sermons.fields.getByName("service_type")

  sermons.fields.add(new SelectField({
    id: serviceType.id,
    name: "service_type",
    required: true,
    maxSelect: 1,
    values: ["morning", "evening", "special"],
  }))

  app.save(sermons)
}, (app) => {
  const sermons = app.findCollectionByNameOrId("sermons")
  const serviceType = sermons.fields.getByName("service_type")

  sermons.fields.add(new SelectField({
    id: serviceType.id,
    name: "service_type",
    required: true,
    maxSelect: 1,
    values: ["morning", "evening"],
  }))

  app.save(sermons)
})
