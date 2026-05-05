export type RoleKey = "super_admin"|"org_admin"|"coordinator"|"instructor"|"manager"|"student"|"parent"|"child";

export const roleDashboardTitle: Record<string, string> = {
  super_admin: "Dashboard Super Admin",
  org_admin: "Dashboard Empresa/Instituição",
  coordinator: "Dashboard Coordenação",
  instructor: "Dashboard Professor",
  manager: "Dashboard Gestor",
  student: "Dashboard Aluno/Colaborador",
  parent: "Dashboard Pais",
  child: "Dashboard Filho",
};
