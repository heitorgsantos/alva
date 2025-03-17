const queryConsultaAssocEmails = (id) => `query obejtosAssocEmails {
    __typename
    CRM {
      email(uniqueIdentifier: "hs_object_id", uniqueIdentifierValue: "${id}") {
        associations {
          company_collection__email_to_company {
            items {
              hs_object_id
            }
          }
          contact_collection__email_to_contact {
            items {
              hs_object_id
            }
          }
          deal_collection__email_to_deal {
            items {
              hs_object_id
            }
          }
        }
      }
    }
  }
  `;

module.exports = { queryConsultaAssocEmails };
