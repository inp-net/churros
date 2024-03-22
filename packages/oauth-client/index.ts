export type UserInfo = {
  uid: string;
  fullName: string;
  firstName: string;
  lastName: string;
  groupsUids: string[];
  email: string;
  ldapInternalEmail: string;
};

export class ChurrosClient {
  public clientId: string;
  public clientSecret: string;
  public redirectURI: string;
  public state: string | undefined;
  public token: string | undefined;

  constructor({
    client_id,
    client_secret,
    redirect_uri,
  }: {
    client_id: string;
    client_secret: string;
    redirect_uri: string;
  }) {
    this.clientId = client_id;
    this.clientSecret = client_secret;
    this.redirectURI = redirect_uri;
  }

  generateState(): asserts this is this & { state: string } {
    this.state = Math.random().toString(36).slice(2, 15);
  }

  get redirectURL(): URL {
    return new URL(this.redirectURI);
  }

  get authorizationURL() {
    if (!this.state) this.generateState();

    return `https://churros.inpt.fr/authorize?${new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectURI,
      response_type: 'code',
      state: this.state ?? '',
    }).toString()}`;
  }

  get tokenURL() {
    return `https://churros.inpt.fr/token`;
  }

  get userInfoURL() {
    return `https://churros.inpt.fr/identity`;
  }

  async getToken(code: string, state: string): Promise<string> {
    if (state !== this.state) throw new Error('Invalid state, potential CSRF attack');

    const response = await fetch(this.tokenURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + btoa(this.clientId + ':' + this.clientSecret),
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: this.redirectURI,
      }),
    });

    const { access_token, token_type } = (await response.json()) as {
      access_token: string;
      token_type: string;
    };
    if (token_type !== 'bearer') throw new Error('Invalid token type, expected bearer');

    return (this.token = access_token);
  }

  async getUserInfo(token: string): Promise<UserInfo> {
    const response = await fetch(this.userInfoURL, {
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + token,
      },
    });

    return (await response.json()) as unknown as UserInfo;
  }
}
