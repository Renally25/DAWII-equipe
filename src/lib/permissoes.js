export const permissoes = {
  psicologo: {
    acessarProntuario: true,
    acessarDiarios: true,
    acessarTreinos: false,
  },

  treinador: {
    acessarProntuario: false,
    acessarDiarios: false,
    acessarTreinos: true,
  },

  fisioterapeuta: {
    acessarProntuario: true,
    acessarDiarios: false,
    acessarTreinos: false,
  },
};


export function temPermissao(tipoUsuario, ...permissoesSolicitadas) {

  return permissoesSolicitadas.every(
    (permissao) => permissoes[tipoUsuario]?.[permissao] === true
  );

}