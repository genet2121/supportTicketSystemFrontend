import { isDesktop } from 'react-device-detect';

import FieldTypes from "../Enums/FiedTypes";
import UserRoles from "../Enums/UserRoles";

import IField from "../Intefaces/IField";
import IForm from "../Intefaces/IForm";
import IPagination from "../Intefaces/IPagination";
import Utils from "../Models/Utils";
import LocalData from "../Intefaces/LocalData";
import AuthResult from "../Intefaces/AuthResult";
import AdminAPI from "../APIs/AdminAPI";
import sanitizeHtml from 'sanitize-html';


const localStatus = [
  {
    value: "ACTIVE",
    label: "Active",
    color: "green",
    bgColor: "rgba(0, 128, 0, 0.298)",
  },
  { value: "ACTIVE", label: "Inactive", color: "#FF1515FF", bgColor: "#FF10106E" },
];



const availableStatus = [
  {
    value: "OPEN",
    label: "Open",
    color: "green",
    bgColor: "rgba(0, 128, 0, 0.298)",
  },
  {
    value: "IN_PROGRESS",
    label: "In Progress",
    color: "white",
    bgColor: "#FFD700FF",
  },
  { value: "CLOSED", label: "Closed", color: "#FF1515FF", bgColor: "#FF10106E" },
];

const localRoles = [
  {
    value: UserRoles.ADMIN,
    label: "Admin",
    color: "green",
    bgColor: "rgba(0, 128, 0, 0.298)",
  },
  {
    value: UserRoles.USER,
    label: "User",
    color: "#694F8E",
    bgColor: "#E2C2EDFF",
  },
  {
    value: UserRoles.OTHER,
    label: "Other",
    color: "orange",
    bgColor: "rgba(255, 166, 0, 0.298)",
  },
];


const uploadImage = async (
  token: string,
  table: string,
  attachment: { file: any; name: string }
): Promise<any> => {
  try {
    let response = await AdminAPI.uploadImage(attachment.file);
    return response;
  } catch (error) {
    return 0;
  }
};

const mapSingle = (fields: IField[], mappings: any, data: any) => {
  let new_fields: IField[] = fields.map((fld) => {
    let mpfunc = mappings[`${fld.id}`];
    if (mpfunc) {
      return {
        ...fld,
        ...mpfunc(data),
      };
    } else {
      return fld;
    }
  });

  return new_fields;
};

const mapValue = async (fields: IField[], token?: string, table?: string) => {
  let new_instance: any = {};

 
  let single_field;
  let charToCheck = /[<>;]/g;

  for (let i = 0; i < fields.length; i++) {
    single_field = fields[i];
    if (
      single_field.value == "" ||
      single_field.value == null ||
      (single_field.type == FieldTypes.NUMBER &&
     
        Number.isNaN(single_field.value))
    ) {
      if (single_field.required) {
        throw new Error(`The field ${single_field.label} is required!`);
      }
    } else {
    

      if (
        single_field.type == FieldTypes.NUMBER
        // || single_field.type == FieldTypes.REFERENCE
      ) {
        new_instance[single_field.id] = Number.isInteger(single_field.value)
          ? parseInt(single_field.value)
          : parseFloat(single_field.value);
      } else if (
        single_field.type == FieldTypes.DATE ||
        single_field.type == FieldTypes.DATETIME
      ) {
        new_instance[single_field.id] = new Date(
          single_field.value
        ).toISOString();
      } else if (single_field.type == FieldTypes.IMAGE) {
        if (!Number.isInteger(single_field.value)) {
          console.log("called once ", single_field.value);
          new_instance[single_field.id] = await uploadImage(
            token ?? "user",
            table ?? "user",
            {
              file: single_field.value.files[0],
              name: "image from input",
            }
          );
        } else {
          new_instance[single_field.id] = single_field.value;
        }
      } else if (single_field.type == FieldTypes.TEXTAREA) {
        // Sanitize the HTML content for TEXTAREA fields
        new_instance[single_field.id] = sanitizeHtml(single_field.value);
      } else {
        new_instance[single_field.id] = single_field.value;
      }
    }
  }

  return new_instance;
};

const tables: IForm[] = [
  {
    title: "Users",
    id: "tbl_user",
    roles: [UserRoles.ADMIN],
    hasAttachment: false,
    realId: "id",
    notDisplayAddButton: true,
    idColumn: "name",
    actions: [
      {
        roles: [UserRoles.ADMIN],
        lable: "Update",
        class: "btn zbtn",
        action: async (token: string, fields: IField[]) => {
          let new_user: any = {};
          let Id!: string;

          fields.forEach((fld) => {
            if (["id","email","name",  "password", "phone", "type", "status"].includes(fld.id)) {
              new_user[fld.id] = fld.value;
            }
            if (fld.id === "id") {
              Id = fld.value;
            }
          });
          if (Id) {
            new_user.id = Id;
            new_user.password = undefined;
          }
          console.log('fields++++', fields);
          console.log('idID++++', new_user);

          
         
          const data = {
            tableName: "user",
            data: new_user,
          };
          let admin_result = await AdminAPI.update(
            token,
            `crud/update`,
            data
            
          );
          console.log('admin_result', admin_result);
          return admin_result.message;
        },
      },

    ],
    relatedList: [],
    fields: [
      {
        id: "id",
        label: "user identification",
        type: FieldTypes.TEXT,
        description: "id",
        value: "",
        order: 1,
        required: false,
        visible: false,
        readonly: true,
        notOnList: true,
        // options?: { value: string, label: string }[];
        onchange: async (
          token: string,
          fields: IField[],
          value: any,
          set_field: (index: number, value: IField) => void
        ): Promise<any> => {
          return value;
        },
      },
      {
        id: "name",
        label: "FullName",
        type: FieldTypes.TEXT,
        description: "Full-name",
        value: "",
        order: 1,
        required: false,
        visible: true,
        readonly: false,
        notOnList: false,
        // options?: { value: string, label: string }[];
        onchange: async (
          token: string,
          fields: IField[],
          value: any,
          set_field: (index: number, value: IField) => void
        ): Promise<any> => {
          return value;
        },
      },
    
      {
        id: "email",
        label: "Email Address",
        type: FieldTypes.EMAIL,
        description: "User Email Address",
        value: "",
        order: 20,
        required: false,
        visible: true,
        readonly: false,
        // options?: { value: string, label: string }[];
        onchange: async (
          token: string,
          fields: IField[],
          value: any,
          set_field: (index: number, value: IField) => void
        ): Promise<any> => {
          return value;
        },
      },
      {
        id: "phone",
        label: "Phone Number",
        type: FieldTypes.TEXT,
        description: "User phone",
        value: "",
        order: 20,
        required: false,
        visible: true,
        readonly: false,
        // options?: { value: string, label: string }[];
        onchange: async (
          token: string,
          fields: IField[],
          value: any,
          set_field: (index: number, value: IField) => void
        ): Promise<any> => {
          return value;
        },
      },
      {
        id: "password",
        label: "Password",
        type: FieldTypes.PASSWORD,
        description: "User Password",
        value: "",
        order: 20,
        required: false,
        notOnList: true,
        visible: true,
        readonly: false,
        notFilter: false,
        // options?: { value: string, label: string }[];
        onchange: async (
          token: string,
          fields: IField[],
          value: any,
          set_field: (index: number, value: IField) => void
        ): Promise<any> => {
          return value;
        },
      },
      {
        id: "type",
        label: "Role ",
        type: FieldTypes.SELECT,
        description: "User Role",
        value: "",
        order: 30,
        required: true,
        options: localRoles,
        visible: true,
        readonly: false,
        
        onchange: async (
          token: string,
          fields: IField[],
          value: any,
          set_field: (index: number, value: IField) => void
        ): Promise<any> => {
          return value;
        },
      },
     
     
     
     
      {
        id: "status",
        label: "Status",
        type: FieldTypes.SELECT,
        description: "is_active",
        value: "",
        order: 1,
        required: false,
        visible: true,
        notOnList: false,
        readonly: false,
        options: localStatus,
        onchange: async (
          token: string,
          fields: IField[],
          value: any,
          set_field: (index: number, value: IField) => void
        ): Promise<any> => {
          return value;
        },
      },
   
    ],
 
  

    onsubmit: async (token: string, fields: IField[]): Promise<any> => {
      let new_instance = await mapValue(fields, token, "user");
      new_instance.status = undefined;
      // const data = {
      //   tableName: "user",
      //   data: new_instance,
      // };
      let admin_result = await AdminAPI.createNew(token, "crud/create", {
        tableName: "user",
        data: new_instance,
      });
      return admin_result;
    },

    onload: async (
      token: string,
      all_fields: IField[],
      localData: LocalData | any,
      loggedUser: AuthResult | any,
      id?: any
    ): Promise<IField[]> => {
      // let is_admin = loggedUser.Roles.includes(UserRoles.ADMIN);

      if (parseInt(id) <= 0) {
        let mappings = {
          id: (data: any) => ({
            value: "",
            readonly: false,
          }),
          name: (data: any) => ({
            value: "",
            readonly: false,
          }),
        
          type: (data: any) => ({
            value: "",
            options: localRoles,
        }),
       
          email: (data: any) => ({
            value: "",
            required: true,
            readonly: false,
          }),
          phone: (data: any) => ({
            value: "",
            required: true,
            readonly: false,
          }),
          
        
          password: (data: any) => ({
            value: "",
            
            readonly: false,
          }),
        
          status: (data: any) => ({
            value: true,
            readonly: true,
            required: false,
          }),
        };

        return mapSingle(all_fields, mappings, {});
        // return all_fields.map(fld => {fld.value = ""; return fld;});
      }

      let data = await AdminAPI.getSingle(token, "crud/getform/user", id);
console.log('dataddwds', data);
      if (data) {
        let mappings = {
          id: (data: any) => ({
            value: data.id,
          }),
          name: (data: any) => ({
            value: data.name,
          }),
       
       
          email: (data: any) => ({
            value: data.email,
            required: true,
            readonly: false,
          }),
          phone: (data: any) => ({
            value: data.phone,
            required: true,
            readonly: false,
          }),
         
          type: (data: any) => ({
            value: data.type,
            // options: localData.roles.map((dt: any) => ({
            //   value: dt.name,
            //   label: dt.name,
            // })),
          }),
          status: (data: any) => ({
             value: data.status,
            //  options: localData.status.map((dt: any) => ({
            //   value: dt.name,
            //   label: dt.name,
            // })),
            // readonly: loggedUser.role == UserRoles.MEMBER,
            required: true,
          }),
        };

        return mapSingle(all_fields, mappings, data);
      }

      return all_fields;
    },

    listLoader: async (
      token: string,
      pageNumber: number,
      pageSize: number,
      localData: LocalData | any,
      loggedUser?: any,
      condition?: any
    ): Promise<IPagination<any>> => {
      let data: any = await AdminAPI.getAll(
        token,
        "crud/getlist/user",
        pageNumber,
        pageSize,
        condition,
     
      );
console.log('localRoles', localRoles);

      let records = data.Items.map((rec: any) => ({
        ...rec,
        status: localStatus.find((rl) => rl.value == rec.status) ?? "",
        // roles: rec.roles[0],
        
       
        type: localRoles.find((rl) => rl.value == rec.type) ?? "",
        
      }));
      
      console.log('Mapped records with roles:', records);
    
      data.Items = records;
      return data;
    },
  },
  {
    title: "Tikets",
    id: "tbl_ticket",
    roles: [ UserRoles.ADMIN],
    notDisplayAddButton: true,
    hasAttachment: false,
    realId: "id",
    idColumn: "title",
    actions: [
      {
        roles: [UserRoles.ADMIN],
        lable: "Update Status",
        class: "btn zbtn",
        action: async (token: string, fields: IField[]) => {
          let new_user: any = {};
          let Id!: string;

          fields.forEach((fld) => {
            if (["id","status"].includes(fld.id)) {
              new_user[fld.id] = fld.value;
            }
            console.log('fld', fld);
            if (fld.id === "name") {
              Id = fld.value;
            }
          });
          if (Id) {
            new_user.id = Id;
           
          }
          const data = {
            tableName: "ticket",
            data: new_user,
          };
        let admin_result = await AdminAPI.update(
          token,
          `crud/update`,
          data
          
        );
          return admin_result.message;
        },
      },
    
    ],
    relatedList: [],
    fields: [
      {
        id: "id",
        label: "Identifier",
        type: FieldTypes.TEXT,
        description: "ticket identifier name",
        value: "",
        order: 1,
        required: false,
        visible: false,
        notOnList: true,
        readonly: true,
        // options?: { value: string, label: string }[];
        onchange: async (
          token: string,
          fields: IField[],
          value: any,
          set_field: (index: number, value: IField) => void
        ): Promise<any> => {
          return value;
        },
      },
      {
        id: "title",
        label: "Title",
        type: FieldTypes.TEXT,
        description: " enter is ticket title",
        value: "",
        order: 10,
        required: true,
        visible: true,
        // options?: { value: string, label: string }[];
        onchange: async (
          token: string,
          fields: IField[],
          value: any,
          set_field: (index: number, value: IField) => void
        ): Promise<any> => {
          return value;
        },
      },
      {
        id: "userId",
        label: "Ticket Creator Name",
        type: FieldTypes.REFERENCE,
        description: "enter user name",
        value: "",
        order: 10,
        required: true,
        visible: true,
        references: "tbl_user",
        // options?: { value: string, label: string }[];
        onchange: async (
          token: string,
          fields: IField[],
          value: any,
          set_field: (index: number, value: IField) => void
        ): Promise<any> => {
          return value;
        },
      },
      {
        id: "description",
        label: "Description",
        type: FieldTypes.TEXTAREA,
        description: " enter ticket description",
        value: "",
        order: 20,
        required: false,
        visible: true,
        readonly: false,
        // options?: { value: string, label: string }[];
        onchange: async (
          token: string,
          fields: IField[],
          value: any,
          set_field: (index: number, value: IField) => void
        ): Promise<any> => {
          return value;
        },
      },
     
      {
        id: "status",
        label: "Status",
        type: FieldTypes.SELECT,
        description: "ticket status",
        value: "",
        order: 1,
        required: false,
        visible: true,
        notOnList: false,
        readonly: false,
        options: availableStatus,
        onchange: async (
          token: string,
          fields: IField[],
          value: any,
          set_field: (index: number, value: IField) => void
        ): Promise<any> => {
          return value;
        },
      },

     
    ],

    onsubmit: async (token: string, fields: IField[]): Promise<any> => {
      let new_instance = await mapValue(fields, token, "ticket");
      new_instance.status = undefined;
      new_instance.userId = undefined;
      const stripHtml = (html: string) => html.replace(/<[^>]*>/g, '');
       if (new_instance.description) {
          new_instance.description = stripHtml(new_instance.description);
        }

      return await AdminAPI.createNew(token, "crud/create", { tableName: "ticket",
    data: new_instance}
        
      );
    },

    onload: async (
      token: string,
      all_fields: IField[],
      localData: LocalData | any,
      loggedUser: AuthResult | any,
      id?: any
    ): Promise<IField[]> => {
      // let is_admin = loggedUser.Roles.includes(UserRoles.ADMIN);

      if (parseInt(id) <= 0) {
        let mappings = {
        
          id: (data: any) => ({
            value: "",
          }),
          title: (data: any) => ({
            value: "",
          }),
          userId: (data: any) => ({
            value: "",
            options: localData.users.map((dt: any) => ({
              value: dt.id,
              label: dt.name,
              
            })),
            required: false,
            readonly: true,
          }),
          description: (data: any) => ({
            value: "",
          }),
       
          status: (data: any) => ({
            value: "",
            readonly: true
          }),
      
         
        };

        return mapSingle(all_fields, mappings, {});
        // return all_fields.map(fld => {fld.value = ""; return fld;});
      }

      let data = await AdminAPI.getSingle(
        token,
        `crud/getform/ticket`,
        id,
        
      );
      if (data) {
        let mappings = {
          id: (data: any) => ({
            value: data.id,
          }),
          title: (data: any) => ({
            value: data.title,
            required: false,
            readonly: true
          }),
          userId: (data: any) => ({
            value: data.userId,
            options: localData.users.map((dt: any) => ({
              value: dt.id,
              label: dt.name,
            })),
            required: false,
            readonly: true

          }),
          description: (data: any) => ({
            value: data.description,
            required: false,
            readonly: true
          }),
       
          status: (data: any) => ({
            value: data.description,
            required: false,
          }),
         

         
        };

        return mapSingle(all_fields, mappings, data);
      }

      return all_fields;
    },

    listLoader: async (
      token: string,
      pageNumber: number,
      pageSize: number,
      localData: LocalData | any,
      loggedUser?: any,
      condition?: any
    ): Promise<IPagination<any>> => {
      let data: any = await AdminAPI.getAll(
        token,
        "crud/getlist/ticket",
        pageNumber,
        pageSize,
        condition,
       
      );

      // let records = data.map((rec: any) => ({
      //   id: rec.name, 
      //   ...rec,
      // }));
      let records = data.Items.map((rec: any) => ({
        ...rec,
          
        status: availableStatus.find((rl) => rl.value == rec.status) ?? "",
        userId: localData.users.find((mbs: any) => (mbs.id == rec.userId)).name,
      }));
      

      console.log("adada", data);
      data.Items = records;
      
      return data;
    },
  },
  {
    title: "My Tikets",
    id: "tbl_myticket",
    roles: [UserRoles.USER],
    notDisplayAddButton: false,
    hasAttachment: false,
    realId: "id",
    idColumn: "title",
    actions: [
      {
        roles: [UserRoles.USER],
        lable: "Update",
        class: "btn zbtn",
        action: async (token: string, fields: IField[]) => {
          let new_user: any = {};
          let Id!: string;

          fields.forEach((fld) => {
            if (["id", "title","userId","description",  "status", ].includes(fld.id)) {
              new_user[fld.id] = fld.value;
            }
            console.log('fld', fld);
            if (fld.id === "name") {
              Id = fld.value;
            }
          });
          new_user.status = undefined;
          new_user.userId = undefined;
          const stripHtml = (html: string) => html.replace(/<[^>]*>/g, '');
           if (new_user.description) {
              new_user.description = stripHtml(new_user.description);
            }
            if (Id) {
              new_user.id = Id;
             
            }
            const data = {
              tableName: "ticket",
              data: new_user,
            };
          let admin_result = await AdminAPI.update(
            token,
            `crud/update`,
            data
            
          );
          console.log('admin_result', admin_result);
          return admin_result.message;
        },
      },
    
    
    ],
    relatedList: [],
    fields: [
      {
        id: "id",
        label: "Identifier",
        type: FieldTypes.TEXT,
        description: "ticket identifier name",
        value: "",
        order: 1,
        required: false,
        visible: false,
        notOnList: true,
        readonly: true,
        // options?: { value: string, label: string }[];
        onchange: async (
          token: string,
          fields: IField[],
          value: any,
          set_field: (index: number, value: IField) => void
        ): Promise<any> => {
          return value;
        },
      },
      {
        id: "title",
        label: "Title",
        type: FieldTypes.TEXT,
        description: " enter is ticket title",
        value: "",
        order: 10,
        required: true,
        visible: true,
        // options?: { value: string, label: string }[];
        onchange: async (
          token: string,
          fields: IField[],
          value: any,
          set_field: (index: number, value: IField) => void
        ): Promise<any> => {
          return value;
        },
      },
      {
        id: "userId",
        label: "Ticket Creator Name",
        type: FieldTypes.REFERENCE,
        description: "enter user name",
        value: "",
        order: 10,
        required: true,
        visible: true,
        references: "tbl_user",
        // options?: { value: string, label: string }[];
        onchange: async (
          token: string,
          fields: IField[],
          value: any,
          set_field: (index: number, value: IField) => void
        ): Promise<any> => {
          return value;
        },
      },
      {
        id: "description",
        label: "Description",
        type: FieldTypes.TEXTAREA,
        description: " enter ticket description",
        value: "",
        order: 20,
        required: false,
        visible: true,
        readonly: false,
        // options?: { value: string, label: string }[];
        onchange: async (
          token: string,
          fields: IField[],
          value: any,
          set_field: (index: number, value: IField) => void
        ): Promise<any> => {
          return value;
        },
      },
     
      {
        id: "status",
        label: "Status",
        type: FieldTypes.SELECT,
        description: "ticket status",
        value: "",
        order: 1,
        required: false,
        visible: true,
        notOnList: false,
        readonly: false,
        options: availableStatus,
        onchange: async (
          token: string,
          fields: IField[],
          value: any,
          set_field: (index: number, value: IField) => void
        ): Promise<any> => {
          return value;
        },
      },

     
    ],

    onsubmit: async (token: string, fields: IField[]): Promise<any> => {
      let new_instance = await mapValue(fields, token, "ticket");
      new_instance.status = undefined;
      new_instance.userId = undefined;
      const stripHtml = (html: string) => html.replace(/<[^>]*>/g, '');
       if (new_instance.description) {
          new_instance.description = stripHtml(new_instance.description);
        }

      return await AdminAPI.createNew(token, "crud/create", { tableName: "ticket",
    data: new_instance}
        
      );
    },

    onload: async (
      token: string,
      all_fields: IField[],
      localData: LocalData | any,
      loggedUser: AuthResult | any,
      id?: any
    ): Promise<IField[]> => {
      // let is_admin = loggedUser.Roles.includes(UserRoles.ADMIN);

      if (parseInt(id) <= 0) {
        let mappings = {
        
          id: (data: any) => ({
            value: "",
          }),
          title: (data: any) => ({
            value: "",
          }),
          userId: (data: any) => ({
            value: "",
            options: localData.users.map((dt: any) => ({
              value: dt.id,
              label: dt.name,
              
            })),
            required: false,
            readonly: true,
          }),
          description: (data: any) => ({
            value: "",
          }),
       
          status: (data: any) => ({
            value: "",
            readonly: true
          }),
      
         
        };

        return mapSingle(all_fields, mappings, {});
        // return all_fields.map(fld => {fld.value = ""; return fld;});
      }

      let data = await AdminAPI.getSingle(
        token,
        `crud/getform/ticket`,
        id,
        
      );
      if (data) {
        let mappings = {
          id: (data: any) => ({
            value: data.id,
          }),
          title: (data: any) => ({
            value: data.title,
            required: false,
          }),
          userId: (data: any) => ({
            value: data.userId,
            options: localData.users.map((dt: any) => ({
              value: dt.id,
              label: dt.name,
            })),
            readonly: true,
            required: false,
          }),
          description: (data: any) => ({
            value: data.description,
            required: false,
          }),
       
          status: (data: any) => ({
            value: data.status,
            required: false,
            readonly: true,
          }),
         

         
        };

        return mapSingle(all_fields, mappings, data);
      }

      return all_fields;
    },

    listLoader: async (
      token: string,
      pageNumber: number,
      pageSize: number,
      localData: LocalData | any,
      loggedUser: AuthResult | any,
      condition?: any
    ): Promise<IPagination<any>> => {
      console.log('loggedUser', loggedUser);
       condition = {
				"userId": {
				   
					"operator": "equal",
					"value": loggedUser.Id
				}
			}
      let data: any = await AdminAPI.getAll(
        token,
        "crud/getlist/ticket",
        pageNumber,
        pageSize,
        condition,
       
      );

      // let records = data.map((rec: any) => ({
      //   id: rec.name, 
      //   ...rec,
      // }));
      let records = data.Items.map((rec: any) => ({
        ...rec,
          
        status: availableStatus.find((rl) => rl.value == rec.status) ?? "",
        userId: localData.users.find((mbs: any) => (mbs.id == rec.userId)).name,
      }));
      

      console.log("adada", data);
      data.Items = records;
      
      return data;
    },
  },
  
  {
    title: "Response",
    id: "tbl_response",
    roles: [UserRoles.ADMIN],
    hasAttachment: false,
    realId: "id",
    idColumn: "id",
    actions: [
      {
        roles: [UserRoles.ADMIN],
        lable: "Update",
        class: "btn zbtn",
        action: async (token: string, fields: IField[]) => {
          let new_user: any = {};
          let Id!: string;

          fields.forEach((fld) => {
            if (["id", "ticketId",  "userId",  "message", "createdAt"].includes(fld.id)) {
              new_user[fld.id] = fld.value;
            }
            console.log('fld', fld);
            if (fld.id === "name") {
              Id = fld.value;
            }
          });
          if (Id) {
            new_user.id = Id;
           
          }
          // new_user.adminId = undefined;
          new_user.userId = undefined;
          new_user.createdAt = undefined
          const data = {
            tableName: "response",
            data: new_user,
          };
        let admin_result = await AdminAPI.update(
          token,
          `crud/update`,
          data
          
        );
         
          
          console.log('admin_result', admin_result);
          return admin_result.message;
        },
      },
    
    ],
    relatedList: [],
    fields: [
      {
        id: "id",
        label: "Identifier",
        type: FieldTypes.TEXT,
        description: "response identifier",
        value: "",
        order: 1,
        required: false,
        visible: false,
        notOnList: false,
        readonly: true,
        // options?: { value: string, label: string }[];
        onchange: async (
          token: string,
          fields: IField[],
          value: any,
          set_field: (index: number, value: IField) => void
        ): Promise<any> => {
          return value;
        },
      },
      {
        id: "ticketId",
        label: "Ticket Title",
        type: FieldTypes.REFERENCE,
        description: " enter ",
        value: "",
        order: 10,
        required: true,
        visible: true,
        references: "tbl_ticket",
        
        onchange: async (
          token: string,
          fields: IField[],
          value: any,
          set_field: (index: number, value: IField) => void,
          localData
        ): Promise<any> => {
          let user_name_field ;
          let selected_ticket = localData.tickets.find(
            (cmp: any) => cmp.id == value.value
          );

          let name_index = fields.findIndex(
            (item) => item.id == "userId"
          );

         

          if (!selected_ticket) {

            if (name_index > -1) {
              user_name_field = fields[name_index];
              user_name_field.value = "";
              user_name_field.readonly = false;
  
              set_field(name_index, user_name_field);
            }

           

            return value;
          }

          if (name_index > -1) {
            user_name_field = fields[name_index];
            user_name_field.value = selected_ticket.userId;
            user_name_field.readonly = true;

            set_field(name_index, user_name_field);
          }

          
         

          return value;
        },
      },
      // {
      //   id: "adminId",
      //   label: "Responser Name",
      //   type: FieldTypes.REFERENCE,
      //   description: "enter responser name",
      //   value: "",
      //   order: 10,
      //   required: false,
      //   visible: true,
      //   references: "tbl_user",
      //   // options?: { value: string, label: string }[];
      //   onchange: async (
      //     token: string,
      //     fields: IField[],
      //     value: any,
      //     set_field: (index: number, value: IField) => void
      //   ): Promise<any> => {
      //     return value;
      //   },
      // },
      {
        id: "userId",
        label: "Ticket Creator Name",
        type: FieldTypes.REFERENCE,
        description: "enter ticket creator name",
        value: "",
        order: 10,
        required: false,
        visible: true,
        references: "tbl_user",
        // options?: { value: string, label: string }[];
        onchange: async (
          token: string,
          fields: IField[],
          value: any,
          set_field: (index: number, value: IField) => void
        ): Promise<any> => {
          return value;
        },
      },
      {
        id: "message",
        label: "Message",
        type: FieldTypes.TEXTAREA,
        description: " enter message",
        value: "",
        order: 20,
        required: false,
        visible: true,
        readonly: false,
        // options?: { value: string, label: string }[];
        onchange: async (
          token: string,
          fields: IField[],
          value: any,
          set_field: (index: number, value: IField) => void
        ): Promise<any> => {
          return value;
        },
      },
      {
        id: "createdAt",
        label: "Created Date",
        type: FieldTypes.DATE,
        description: "enter created date",
        value: "",
        order: 10,
        required: false,
        visible: true,
        readonly: false,
        // options?: { value: string, label: string }[];
        onchange: async (
          token: string,
          fields: IField[],
          value: any,
          set_field: (index: number, value: IField) => void
        ): Promise<any> => {
          return value;
        },
      },

     
    ],

    onsubmit: async (token: string, fields: IField[]): Promise<any> => {
      let new_instance = await mapValue(fields, token, "response");
      new_instance.createdAt = undefined
      new_instance.adminId = undefined;

      const stripHtml = (html: string) => html.replace(/<[^>]*>/g, '');
      if (new_instance.message) {
         new_instance.message = stripHtml(new_instance.message);
       }

     return await AdminAPI.createNew(token, "crud/create", { tableName: "response",
   data: new_instance}
       
     );
      // return await AdminAPI.createNew(token, "crud/create", new_instance);
    },

    onload: async (
      token: string,
      all_fields: IField[],
      localData: LocalData | any,
      loggedUser: AuthResult | any,
      id?: any
    ): Promise<IField[]> => {
      // let is_admin = loggedUser.Roles.includes(UserRoles.ADMIN);
   
      if (parseInt(id) <= 0) {
        let mappings = {
          id: (data: any) => ({
            value: "",
          }),
          ticketId: (data: any) => ({
            value: "",
            options: localData.tickets.map((dt: any) => ({
              value: dt.id,
              label: dt.title,
            })),
          }),
          // adminId: (data: any) => ({
          //   value: "",
          //   readonly: true,
          //   options: localData.users.map((dt: any) => ({
          //     value: dt.id,
          //     label: dt.name,
          //   })),
          // }),
          userId: (data: any) => ({
            value: "",
            readonly: false,
            options: localData.users.map((dt: any) => ({
              value: dt.id,
              label: dt.name,
            })),
          }),
          message: (data: any) => ({
            value: "",
          }),
          createdAt: (data: any) => ({
            value: "",
            readonly: true
          }),
         
        };

        return mapSingle(all_fields, mappings, {});
        // return all_fields.map(fld => {fld.value = ""; return fld;});
      }

      let data = await AdminAPI.getSingle(
        token,
        `crud/getform/response`,
        id,
      
      );
      if (data) {
        let mappings = {
          id: (data: any) => ({
            value: data.id,
          }),
          ticketId: (data: any) => ({
            value: data.ticketId,
            required: false,
            options: localData.tickets.map((dt: any) => ({
              value: dt.id,
              label: dt.title,
            })),
          }),
          // adminId: (data: any) => ({
          //   value: data.adminId,
          //   required: false,
          //   options: localData.users.map((dt: any) => ({
          //     value: dt.id,
          //     label: dt.name,
          //   })),
          //   readonly: true,
          // }),
          userId: (data: any) => ({
            value: data.userId,
            required: false,
            options: localData.users.map((dt: any) => ({
              value: dt.id,
              label: dt.name,
            })),
            readonly: true,
          }),
          message: (data: any) => ({
            value: data.message,
            required: false,
            
          }),
          createdAt: (data: any) => ({
            value: Utils.convertISOToDate(data.createdAt),
            required: false,
            readonly: true,
          }),

         
        };

        return mapSingle(all_fields, mappings, data);
      }

      return all_fields;
    },

    listLoader: async (
      token: string,
      pageNumber: number,
      pageSize: number,
      localData: LocalData | any,
      loggedUser?: any,
      condition?: any
    ): Promise<IPagination<any>> => {
      let data: any = await AdminAPI.getAll(
        token,
        "crud/getlist/response",
        pageNumber,
        pageSize,
        condition,
       
      );
     
      let records = data.Items.map((rec: any) => ({
        
        ...rec,
        ticketId: localData.tickets.find((mbs: any) => (mbs.id == rec.ticketId)).title,
        // adminId: localData.users.find((mbs: any) => (mbs.id == rec.adminId)).name,
        userId: localData.users.find((mbs: any) => (mbs.id == rec.userId)).name,
      }));
      

      
      data.Items = records;
      
      return data;
    },
  },
  {
    title: "Responses",
    id: "tbl_seeresponse",
    roles: [UserRoles.USER],
    hasAttachment: false,
    notDisplayAddButton: true,
    realId: "id",
    idColumn: "id",
    actions: [
      // {
      //   roles: [UserRoles.ADMIN],
      //   lable: "Update",
      //   class: "btn zbtn",
      //   action: async (token: string, fields: IField[]) => {
      //     let new_user: any = {};
      //     let Id!: string;

      //     fields.forEach((fld) => {
      //       if (["name", "member","book","loan_date",  "return_date"].includes(fld.id)) {
      //         new_user[fld.id] = fld.value;
      //       }
      //       console.log('fld', fld);
      //       if (fld.id === "name") {
      //         Id = fld.value;
      //       }
      //     });
      //     new_user.return_date = Utils.convertISOToDate( new_user.return_date)
      //     new_user.loan_date = Utils.convertISOToDate( new_user.loan_date)
         
      //     console.log('new_user', new_user);
      //     let admin_result = await AdminAPI.update(
      //       token,
      //       `library_management.api.update_loan`,
      //       {...new_user,
      //         loan_id: Id,
      //         name:undefined,
      //         book:undefined,
      //         member:undefined,
      //         loan_date:undefined
      //       }
            
      //     );
      //     console.log('admin_result', admin_result);
      //     return admin_result.message;
      //   },
      // },
      {
        roles: [UserRoles.USER],
        lable: "View Ticket Detail",
        class: "btn-info shadow-sm",
        action: async (token: string, fields: IField[]) => {
          let new_user: any = {};
          let ticketId!: string;
      
          // Loop through fields and extract relevant data
          fields.forEach((fld) => {
            if (["id", "ticketId", "adminId", "message", "createdAt"].includes(fld.id)) {
              new_user[fld.id] = fld.value;
            }
      
            if (fld.id === "ticketId") {
              ticketId = fld.value;
            }
          });
      
          // Log ticketId to ensure it's valid
          console.log('ticketId:', ticketId);
      
          // If ticketId is available, navigate to the detail page
          if (ticketId) {
            // navigate(`/form/tbl_myticket/${ticketId}`);
          }
        },
      }
      
    ],
    relatedList: [],
    fields: [
      {
        id: "id",
        label: "Identifier",
        type: FieldTypes.TEXT,
        description: "response identifier",
        value: "",
        order: 1,
        required: false,
        visible: false,
        notOnList: false,
        readonly: true,
        // options?: { value: string, label: string }[];
        onchange: async (
          token: string,
          fields: IField[],
          value: any,
          set_field: (index: number, value: IField) => void
        ): Promise<any> => {
          return value;
        },
      },
      {
        id: "ticketId",
        label: "Ticket Title",
        type: FieldTypes.REFERENCE,
        description: " enter ",
        value: "",
        order: 10,
        required: true,
        visible: true,
        references: "tbl_ticket",
        // options?: { value: string, label: string }[];
        onchange: async (
          token: string,
          fields: IField[],
          value: any,
          set_field: (index: number, value: IField) => void
        ): Promise<any> => {
          return value;
        },
      },
      {
        id: "adminId",
        label: "Responser Name",
        type: FieldTypes.REFERENCE,
        description: "enter responser name",
        value: "",
        order: 10,
        required: false,
        visible: true,
        references: "tbl_user",
        // options?: { value: string, label: string }[];
        onchange: async (
          token: string,
          fields: IField[],
          value: any,
          set_field: (index: number, value: IField) => void
        ): Promise<any> => {
          return value;
        },
      },
      {
        id: "message",
        label: "Message",
        type: FieldTypes.TEXTAREA,
        description: " enter message",
        value: "",
        order: 20,
        required: false,
        visible: true,
        readonly: false,
        // options?: { value: string, label: string }[];
        onchange: async (
          token: string,
          fields: IField[],
          value: any,
          set_field: (index: number, value: IField) => void
        ): Promise<any> => {
          return value;
        },
      },
      {
        id: "createdAt",
        label: "Created Date",
        type: FieldTypes.DATE,
        description: "enter created date",
        value: "",
        order: 10,
        required: false,
        visible: true,
        readonly: false,
        // options?: { value: string, label: string }[];
        onchange: async (
          token: string,
          fields: IField[],
          value: any,
          set_field: (index: number, value: IField) => void
        ): Promise<any> => {
          return value;
        },
      },

     
    ],

    onsubmit: async (token: string, fields: IField[]): Promise<any> => {
      let new_instance = await mapValue(fields, token, "response");
      new_instance.createdAt = undefined
      new_instance.adminId = undefined;

      const stripHtml = (html: string) => html.replace(/<[^>]*>/g, '');
      if (new_instance.message) {
         new_instance.message = stripHtml(new_instance.message);
       }

     return await AdminAPI.createNew(token, "crud/create", { tableName: "response",
   data: new_instance}
       
     );
      // return await AdminAPI.createNew(token, "crud/create", new_instance);
    },

    onload: async (
      token: string,
      all_fields: IField[],
      localData: LocalData | any,
      loggedUser: AuthResult | any,
      id?: any
    ): Promise<IField[]> => {
      // let is_admin = loggedUser.Roles.includes(UserRoles.ADMIN);
   
      if (parseInt(id) <= 0) {
        let mappings = {
          id: (data: any) => ({
            value: "",
          }),
          ticketId: (data: any) => ({
            value: "",
            options: localData.tickets.map((dt: any) => ({
              value: dt.id,
              label: dt.title,
            })),
          }),
          adminId: (data: any) => ({
            value: "",
            readonly: true,
            options: localData.users.map((dt: any) => ({
              value: dt.id,
              label: dt.name,
            })),
          }),
          message: (data: any) => ({
            value: "",
          }),
          createdAt: (data: any) => ({
            value: "",
            readonly: true
          }),
         
        };

        return mapSingle(all_fields, mappings, {});
        // return all_fields.map(fld => {fld.value = ""; return fld;});
      }

      let data = await AdminAPI.getSingle(
        token,
        `crud/getform/response`,
        id,
      
      );
      if (data) {
        let mappings = {
          id: (data: any) => ({
            value: data.id,
          }),
          ticketId: (data: any) => ({
            value: data.ticketId,
            required: false,
            options: localData.tickets.map((dt: any) => ({
              value: dt.id,
              label: dt.title,
            })),
          }),
          adminId: (data: any) => ({
            value: data.adminId,
            required: false,
            options: localData.users.map((dt: any) => ({
              value: dt.id,
              label: dt.name,
            })),
          }),
          message: (data: any) => ({
            value: data.message,
            required: false,
            
          }),
          createdAt: (data: any) => ({
            value: data.createdAt,
            required: false,
          }),

         
        };

        return mapSingle(all_fields, mappings, data);
      }

      return all_fields;
    },

    listLoader: async (
      token: string,
      pageNumber: number,
      pageSize: number,
      localData: LocalData | any,
      loggedUser?: AuthResult | any,
      condition?: any
    ): Promise<IPagination<any>> => {
      condition = {
				"userId": {
				   
					"operator": "equal",
					"value": loggedUser.Id
				}
			}
      let data: any = await AdminAPI.getAll(
        token,
        "crud/getlist/response",
        pageNumber,
        pageSize,
        condition,
       
      );
     
      let records = data.Items.map((rec: any) => ({
        
        ...rec,
        ticketId: localData.tickets.find((mbs: any) => (mbs.id == rec.ticketId)).title,
        adminId: localData.users.find((mbs: any) => (mbs.id == rec.adminId)).name,
      }));
      

      
      data.Items = records;
      
      return data;
    },
  },

  
];

export default tables;
