/* eslint-disable no-useless-escape */
import { ServiceInfo } from "../entities/service-info.entity";
import { readServiceInfoSync } from "./readServiceInfo";

export function printLogo(): void {
  const startYear = 2023;
  const endYear = new Date().getFullYear();
  const displayedYearSpan = startYear == endYear ? `${startYear}` : `${startYear} - ${endYear}`;

  let service_info: ServiceInfo;
  try {
    service_info = readServiceInfoSync();
  } catch (e) {
    return;
  }

  console.log(`
    .-+*#%@@@@@@@%#+=:     
  *#.@@@@@@@@@@@@@@@@@@.#*
@@@%.@@%#+==@@@@%=+#@@@++@@@
@@@@.       @@@@#      .%@@@
#@@@#-.     @@@@#      =@@@%
  @@@@@@#*- @@@@#      -*%@*
    *#%@@@# @@@@%-@@@#*+=-.
           #@@@@%:#%@@@@@@%
 .@@@@      @@@@%    :@@@@:
  :@@@#     %@@@%   .@@@@:
   -@@@@*-  %@@@% :+@@@@:   
    .*@@@@# %@@@%-@@@@+     
      :*%@# %@@@%-@@+.      
           :#@@@*.:         
  
© ${displayedYearSpan} TSAlliance | All rights reserved

ID:         ${service_info.client_id}
Service:    ${service_info.client_name}
Version:    ${service_info.client_version}
`);
}
