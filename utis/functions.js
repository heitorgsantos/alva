const { baseOmie, baseHubSpot } = require("./basesApi");
require("dotenv").config();
const APP_KEY = process.env.APP_KEY;
const APP_SECRET = process.env.APP_SECRET;
const PIPELINE = process.env.PIPELINE;
const DEALSTAGE = process.env.DEALSTAGE;

const responseProductsOmie = async (page, perPage) => {
  const params = {
    param: [
      {
        pagina: page,
        registros_por_pagina: perPage,
        apenas_importado_api: "N",
        filtrar_apenas_omiepdv: "N",
      },
    ],
    app_key: APP_KEY,
    app_secret: APP_SECRET,
    call: "ListarProdutos",
  };

  try {
    let pagging;
    let totalPagging;
    const responseOmie = await baseOmie
      .post("api/v1/geral/produtos/", params)
      .then((response) => {
        console.log(response.data.produto_servico_cadastro.length);
        pagging = response.data.pagina;
        totalPagging = response.data.total_de_paginas;

        return response.data.produto_servico_cadastro.map((produto, index) => {
          const recomendacoes_fiscais = produto.recomendacoes_fiscais;

          delete produto.recomendacoes_fiscais;
          delete produto.imagens;
          delete produto.info;
          produto.tipoitem = produto.tipoItem;
          delete produto.tipoItem;
          produto.codint_familia = produto.codInt_familia;
          delete produto.codInt_familia;
          produto.hs_sku = produto.codigo_produto;
          produto.name = produto.descricao;

          return {
            properties: {
              ...produto,
              ...recomendacoes_fiscais,
            },
          };
        });
      });

    return { pagging, totalPagging, responseOmie };
  } catch (error) {
    return error;
  }
};

const searchCompanyOmie = async (id) => {
  const params = {
    param: [
      {
        codigo_cliente_omie: id,
      },
    ],
    app_key: APP_KEY,
    app_secret: APP_SECRET,
    call: "ConsultarCliente",
  };

  try {
    let responseOmie = await baseOmie.post("api/v1/geral/clientes/", params);
    if (responseOmie.status === 200) {
      return responseOmie.data;
    }
    return "Não Encontrado";
  } catch (erro) {
    return erro.message;
  }
};

const returnDealProperties = async (page, perPage) => {
  const params = {
    param: [
      {
        pagina: page,
        registros_por_pagina: perPage,
        apenas_importado_api: "N",
        etapa: "60",
        data_faturamento_de: "03/04/2025",
      },
    ],
    app_key: APP_KEY,
    app_secret: APP_SECRET,
    call: "ListarPedidos",
  };

  try {
    let pagging;
    let totalPagging;
    let arrayDealProperties = [];
    let responseOmie = await baseOmie
      .post("api/v1/produtos/pedido/", params)
      .then(async (response) => {
        pagging = response.data.pagina;
        totalPagging = response.data.total_de_paginas;
        console.log(response.data.pedido_venda_produto.length);
        return response.data.pedido_venda_produto.map((pedido) => {
          const {
            cabecalho: {
              codigo_cliente,
              codigo_empresa,
              codigo_pedido,
              data_previsao,
              etapa,
            },
            infoCadastro: { faturado, dFat, cancelado },
            frete: { valor_frete },
            det: {
              produto: codigo_produto,
              descricao,
              valor_desconto,
              valor_total,
            },
            total_pedido: { valor_mercadorias, valor_total_pedido },
          } = pedido;
          if (faturado === "S") {
            console.log(
              faturado,
              codigo_cliente,
              codigo_empresa,
              codigo_pedido,
              data_previsao,
              etapa,
              faturado,
              dFat,
              cancelado,
              valor_frete,
              valor_mercadorias,
              valor_total_pedido
            );
            const dealsProperties = {
              properties: {
                pipeline: PIPELINE,
                dealstage: DEALSTAGE,
                dealname: `Pedido: ${codigo_pedido}`,
                codigo_cliente,
                codigo_empresa,
                codigo_pedido,
                data_previsao:
                  data_previsao !== undefined ? formataData(data_previsao) : "",
                valor_frete,
                valor_mercadorias,
                valor_total_pedido,
                amount: valor_total_pedido,
                closedate: dFat !== undefined ? formataData(dFat) : "",
                etapa: etapa,
                cancelado: cancelado,
              },
            };
            return dealsProperties;
          }
        });
      });
    const ordersResponse = responseOmie.filter((item) => item !== undefined);
    return { pagging, totalPagging, ordersResponse };
  } catch (error) {
    return error;
  }
};

const associationCompany = async (deals) => {
  for (let index = 0; index < deals.length; index++) {
    console.log("INDEX", index);
    const item = deals[index];

    console.log("aqui", item.properties.hs_object_id);
    const dealId = item.properties.hs_object_id;

    const queryCompany = {
      properties: ["hs_object_id", "codigo_cliente_omie"],
      limit: 100,
      filterGroups: [
        {
          filters: [
            {
              propertyName: "codigo_cliente_omie",
              value: item.properties.codigo_cliente,
              operator: "EQ",
            },
          ],
        },
      ],
    };

    const { results } = await baseHubSpot
      .post(`crm/v3/objects/company/search`, queryCompany)
      .then(async (response) => {
        console.log("Consulta do Negócio", response.data);
        return response.data;
      })
      .catch((error) => error.message);

    if (results.length > 0) {
      console.log("Consulta do Negócio", results[0]);

      const idCompany = results[0].id;
      console.log("ID da empresa", idCompany);

      await baseHubSpot.put(
        `crm/v4/objects/companies/${idCompany}/associations/default/deals/${dealId}`
      );
      await baseHubSpot.patch(
        `crm/v3/objects/deals/${item.properties.hs_object_id}`,
        { properties: { controle: true } }
      );
    } else {
      console.log("Não tem id do cliente");
      await baseHubSpot.patch(
        `crm/v3/objects/deals/${item.properties.hs_object_id}`,
        { properties: { controle: false } }
      );
    }

    if (index >= deals.length) {
      resolve(); // Assuming resolve is defined somewhere in the scope
    }
  }
};

const queryCompanyCnpj = (cnpj_cpf) => ({
  properties: ["hs_object_id", "codigo_cliente_omie", "cnpj", "cpf"],
  limit: 100,
  filterGroups: [
    {
      filters: [
        {
          propertyName: cnpj_cpf.length === 18 ? "cnpj" : "cpf",
          value: cnpj_cpf,
          operator: "EQ",
        },
      ],
    },
  ],
});

function formataData(data) {
  const splitData = data.split("/");
  const dataFormatada = `${splitData[2]}-${splitData[1]}-${splitData[0]}`;
  return dataFormatada;
}

const findCompany = async (queryCompany) => {
  const responseFindCompany = await baseHubSpot
    .post(`crm/v3/objects/companies/search`, queryCompany)
    .then(async (response) => {
      console.log("Consulta da empresa", response.data);
      return response.data;
    })
    .catch((error) => error.message);
  return responseFindCompany;
};

const returnProductsAssociatedsDeals = async (page, perPage) => {
  const params = {
    param: [
      {
        pagina: page,
        registros_por_pagina: perPage,
        apenas_importado_api: "N",
        etapa: "60",
      },
    ],
    app_key: APP_KEY,
    app_secret: APP_SECRET,
    call: "ListarPedidos",
  };
  try {
    let pagging;
    let totalPagging;
    let arrayDealProperties = [];
    let responseOmie = await baseOmie
      .post("api/v1/produtos/pedido/", params)
      .then(async (response) => {
        pagging = response.data.pagina;
        totalPagging = response.data.total_de_paginas;
        console.log(response.data.pedido_venda_produto.length);

        let count = 1;
        for (const item of response.data.pedido_venda_produto) {
          count++;
          const {
            cabecalho: { codigo_pedido },
            det,
          } = item;

          let amount = 0;
          // console.log(codigo_pedido, det)
          // 34906597240
          // 34906597231
          const propertiesLineItems = det.map(({ produto }) => {
            amount += Number(produto.valor_total);
            return formatEvent(produto);
          });
          const propertiesFetchDeal = {
            properties: ["hs_object_id"],
            filterGroups: [
              {
                filters: [
                  {
                    propertyName: "codigo_pedido",
                    value: codigo_pedido,
                    operator: "EQ",
                  },
                ],
              },
            ],
          };

          const responseDealID = await baseHubSpot
            .post("/crm/v3/objects/deals/search", propertiesFetchDeal)
            .then((response) => {
              if (response.data.results.length > 0) {
                return response.data.results[0].id;
              }
              return "Not Found";
            });
          console.log("Deal ID", responseDealID);
          const inputs = propertiesLineItems.map(({ properties }) => ({
            associations: [
              {
                types: [
                  {
                    associationCategory: "HUBSPOT_DEFINED",
                    associationTypeId: 20,
                  },
                ],
                to: {
                  id: responseDealID,
                },
              },
            ],
            properties,
          }));

          if (responseDealID !== "Not Found") {
            console.log("response id", { inputs });
            await baseHubSpot.post("/crm/v3/objects/line_items/batch/create", {
              inputs,
            });
          }

          if (count === 100) {
            resolve();
          }
        }
      });
  } catch (error) {
    return error;
  }
};

const formatEvent = (event) => {
  delete event.recomendacoes_fiscais;
  delete event.imagens;
  delete event.info;
  event.tipoitem = event.tipoItem;
  delete event.tipoItem;
  event.codint_familia = event.codInt_familia;
  delete event.codInt_familia;
  delete event.combustivel;
  event.hs_sku = event.codigo_produto;
  event.name = event.descricao;
  const propertiesProcutcs = {
    properties: event,
  };

  return propertiesProcutcs;
};

module.exports = {
  responseProductsOmie,
  returnDealProperties,
  associationCompany,
  findCompany,
  formataData,
  formatEvent,
  returnProductsAssociatedsDeals,
  queryCompanyCnpj,
  searchCompanyOmie,
};
