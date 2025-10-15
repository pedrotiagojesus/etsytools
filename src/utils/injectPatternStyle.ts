/**
 * Injeta ou atualiza um <style> com o CSS de um padrão específico.
 *
 * @param css O conteúdo CSS a ser injetado.
 * @param id Um identificador único para esse style (ex: "pattern-style-1").
 */
const injectPatternStyle = (css: string, id: string) => {
    if (!css || !id) return;

    // Remove o estilo anterior, se existir
    const existingStyle = document.getElementById(id);
    if (existingStyle) {
        existingStyle.remove();
    }

    // Cria novo elemento <style>
    const style = document.createElement("style");
    style.id = id;
    style.innerHTML = css;
    document.head.appendChild(style);
};

export default injectPatternStyle;
