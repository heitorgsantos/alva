const queryCompany = (propertieId) => ({
  properties: ["hs_object_id", "codigo_cliente_omie"],
  limit: 100,
  filterGroups: [
    {
      filters: [
        {
          propertyName: "codigo_cliente_omie",
          value: propertieId,
          operator: "EQ",
        },
      ],
    },
  ],
});

module.exports = { queryCompany };
